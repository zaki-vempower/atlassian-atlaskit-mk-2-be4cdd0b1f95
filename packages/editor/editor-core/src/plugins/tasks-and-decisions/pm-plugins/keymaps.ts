import { uuid } from '@atlaskit/adf-schema';
import { keymap } from 'prosemirror-keymap';
import { Node, Schema, Fragment, ResolvedPos, Slice } from 'prosemirror-model';
import {
  EditorState,
  Transaction,
  Plugin,
  TextSelection,
} from 'prosemirror-state';
import { findParentNodeOfTypeClosestToPos } from 'prosemirror-utils';
import { insertTaskDecisionWithAnalytics } from '../commands';
import { TaskDecisionListType } from '../types';
import { autoJoin, chainCommands } from 'prosemirror-commands';
import {
  filter,
  isEmptySelectionAtEnd,
  isEmptySelectionAtStart,
} from '../../../utils/commands';
import { Command } from '../../../types';
import {
  ACTION,
  ACTION_SUBJECT,
  ACTION_SUBJECT_ID,
  EVENT_TYPE,
  INDENT_DIR,
  INDENT_TYPE,
  INPUT_METHOD,
  AnalyticsEventPayload,
  withAnalytics,
} from '../../analytics';

import {
  isInsideTaskOrDecisionItem,
  isActionOrDecisionList,
  isActionOrDecisionItem,
  isInsideTask,
  getBlockRange,
  getCurrentIndentLevel,
  walkOut,
  isEmptyTaskDecision,
  liftBlock,
  subtreeHeight,
} from './helpers';

import { liftSelection, wrapSelectionInTaskList, joinAtCut } from './commands';

const indentationAnalytics = (
  curIndentLevel: number,
  direction: INDENT_DIR,
): AnalyticsEventPayload => ({
  action: ACTION.FORMATTED,
  actionSubject: ACTION_SUBJECT.TEXT,
  actionSubjectId: ACTION_SUBJECT_ID.FORMAT_INDENT,
  eventType: EVENT_TYPE.TRACK,
  attributes: {
    inputMethod: INPUT_METHOD.KEYBOARD,
    previousIndentationLevel: curIndentLevel,
    newIndentLevel:
      direction === INDENT_DIR.OUTDENT
        ? curIndentLevel - 1
        : curIndentLevel + 1,
    direction,
    indentType: INDENT_TYPE.TASK_LIST,
  },
});

const nodeAfter = ($pos: ResolvedPos) => $pos.doc.resolve($pos.end()).nodeAfter;

const actionDecisionFollowsOrNothing = ($pos: ResolvedPos) => {
  const after = nodeAfter($pos);
  return !after || isActionOrDecisionItem(after);
};

const joinTaskDecisionFollowing: Command = (state, dispatch) => {
  // look for the node after this current one
  const $next = walkOut(state.selection.$from);

  // if there's no taskItem or taskList following, then
  // we just do the normal behaviour
  const {
    taskList,
    taskItem,
    decisionList,
    decisionItem,
    paragraph,
  } = state.schema.nodes;
  const parentList = findParentNodeOfTypeClosestToPos($next, [
    taskList,
    taskItem,
    decisionList,
    decisionItem,
  ]);
  if (!parentList) {
    if ($next.node().type === paragraph) {
      // try to join paragraph and taskList when backspacing
      return joinAtCut($next.doc.resolve($next.pos))(state, dispatch);
    }

    return true;
  }

  return false;
};

const unindent = filter(isInsideTask, (state, dispatch) => {
  const curIndentLevel = getCurrentIndentLevel(state.selection);
  if (!curIndentLevel || curIndentLevel === 1) {
    return false;
  }

  return withAnalytics(
    indentationAnalytics(curIndentLevel, INDENT_DIR.OUTDENT),
  )(autoJoin(liftSelection, ['taskList']))(state, dispatch);
});

const indent = filter(isInsideTask, (state, dispatch) => {
  // limit ui indentation to 6 levels
  const curIndentLevel = getCurrentIndentLevel(state.selection);
  if (!curIndentLevel || curIndentLevel >= 6) {
    return true;
  }

  const { taskList, taskItem } = state.schema.nodes;
  const { $from, $to } = state.selection;
  const maxDepth = subtreeHeight($from, $to, [taskList, taskItem]);
  if (maxDepth >= 6) {
    return true;
  }

  return withAnalytics(indentationAnalytics(curIndentLevel, INDENT_DIR.INDENT))(
    autoJoin(wrapSelectionInTaskList, ['taskList']),
  )(state, dispatch);
});

const backspaceFrom = ($from: ResolvedPos): Command => (state, dispatch) => {
  // previous was empty, just delete backwards
  const taskBefore = $from.doc.resolve($from.before());
  if (
    taskBefore.nodeBefore &&
    isActionOrDecisionItem(taskBefore.nodeBefore) &&
    taskBefore.nodeBefore.nodeSize === 2
  ) {
    return false;
  }

  // if nested, just unindent
  const { taskList, paragraph } = state.schema.nodes;
  if ($from.node($from.depth - 2).type === taskList) {
    return unindent(state, dispatch);
  }

  // bottom level, should "unwrap" taskItem contents into paragraph
  // we achieve this by slicing the content out, and replacing
  if (actionDecisionFollowsOrNothing($from)) {
    if (dispatch) {
      const taskContent = state.doc.slice($from.start(), $from.end()).content;

      // might be end of document after
      const slice = taskContent.size
        ? paragraph.createChecked(undefined, taskContent)
        : paragraph.createChecked();

      dispatch(splitListItemWith(state.tr, slice, $from, true));
    }

    return true;
  }

  return false;
};

const backspace = filter(
  isEmptySelectionAtStart,
  autoJoin(
    chainCommands(
      (state, dispatch) => joinAtCut(state.selection.$from)(state, dispatch),
      filter(isInsideTaskOrDecisionItem, (state, dispatch) =>
        backspaceFrom(state.selection.$from)(state, dispatch),
      ),
    ),
    ['taskList', 'decisionList'],
  ),
);

const deleteHandler = filter(
  [isInsideTaskOrDecisionItem, isEmptySelectionAtEnd],
  chainCommands(joinTaskDecisionFollowing, (state, dispatch) => {
    // look for the node after this current one
    const $next = walkOut(state.selection.$from);
    const { taskList, paragraph } = state.schema.nodes;

    // previous was empty, just delete backwards
    const taskBefore = $next.doc.resolve($next.before());
    if (
      taskBefore.nodeBefore &&
      isActionOrDecisionItem(taskBefore.nodeBefore) &&
      taskBefore.nodeBefore.nodeSize === 2
    ) {
      return false;
    }

    // if nested, just unindent
    if ($next.node($next.depth - 2).type === taskList) {
      const tr = liftBlock(state.tr, $next, $next);
      if (dispatch && tr) {
        dispatch(tr);
      }

      return true;
    }

    // bottom level, should "unwrap" taskItem contents into paragraph
    // we achieve this by slicing the content out, and replacing
    if (actionDecisionFollowsOrNothing(state.selection.$from)) {
      if (dispatch) {
        const taskContent = state.doc.slice($next.start(), $next.end()).content;

        // might be end of document after
        const slice = taskContent.size
          ? paragraph.createChecked(undefined, taskContent)
          : [];

        dispatch(splitListItemWith(state.tr, slice, $next, false));
      }

      return true;
    }

    return false;
  }),
);

const deleteForwards = autoJoin(deleteHandler, ['taskList', 'decisionList']);

const splitListItemWith = (
  tr: Transaction,
  content: Fragment | Node | Node[],
  $from: ResolvedPos,
  setSelection: boolean,
) => {
  const origDoc = tr.doc;

  // split just before the current item
  // we can only split if there was a list item before us
  const container = $from.node($from.depth - 2);
  const posInList = $from.index($from.depth - 1);
  const shouldSplit = !(!isActionOrDecisionList(container) && posInList === 0);

  if (shouldSplit) {
    // this only splits a node to delete it, so we probably don't need a random uuid
    // but generate one anyway for correctness
    tr = tr.split($from.pos, 1, [
      {
        type: $from.node().type,
        attrs: { localId: uuid.generate() },
      },
    ]);
  }

  // and delete the action at the current pos
  // we can do this because we know either first new child will be taskItem or nothing at all
  const frag = Fragment.from(content);
  tr = tr.replace(
    tr.mapping.map($from.start() - 2),
    tr.mapping.map($from.end() + 2),
    frag.size ? new Slice(frag, 0, 0) : Slice.empty,
  );

  // put cursor inside paragraph
  if (setSelection) {
    tr = tr.setSelection(
      new TextSelection(tr.doc.resolve($from.pos + 1 - (shouldSplit ? 0 : 2))),
    );
  }

  // lift list up if the node after the initial one was a taskList
  // which means it would have empty placeholder content if we just immediately delete it
  //
  // if it's a taskItem then it can stand alone, so it's fine
  const $oldAfter = origDoc.resolve($from.after());

  // if different levels then we shouldn't lift
  if ($oldAfter.depth === $from.depth - 1) {
    if ($oldAfter.nodeAfter && isActionOrDecisionList($oldAfter.nodeAfter)) {
      // getBlockRange expects to be inside the taskItem
      const pos = tr.mapping.map($oldAfter.pos + 2);
      const $after = tr.doc.resolve(pos);

      const blockRange = getBlockRange(
        $after,
        tr.doc.resolve($after.after($after.depth - 1) - 1),
      );
      if (blockRange) {
        tr = tr.lift(blockRange, blockRange.depth - 1).scrollIntoView();
      }

      // we delete 1 past the range of the empty taskItem
      // otherwise we hit a bug in prosemirror-transform:
      // Cannot read property 'content' of undefined
      tr = tr.deleteRange(pos - 3, pos - 1);
    }
  }

  return tr;
};

const splitListItem = (
  state: EditorState,
  dispatch?: (tr: Transaction) => void,
) => {
  let {
    tr,
    selection: { $from },
  } = state;
  const {
    schema: {
      nodes: { paragraph },
    },
  } = state;

  if (actionDecisionFollowsOrNothing($from)) {
    if (dispatch) {
      dispatch(splitListItemWith(tr, paragraph.createChecked(), $from, true));
    }
    return true;
  }

  return false;
};

const enter: Command = filter(
  isInsideTaskOrDecisionItem,
  chainCommands(
    filter(isEmptyTaskDecision, chainCommands(unindent, splitListItem)),
    (state, dispatch) => {
      const { selection, schema } = state;
      const { taskItem } = schema.nodes;
      const { $from } = selection;
      const node = $from.node($from.depth);
      const nodeType = node && node.type;
      const listType: TaskDecisionListType =
        nodeType === taskItem ? 'taskList' : 'decisionList';

      const addItem = ({
        tr,
        itemLocalId,
      }: {
        tr: Transaction;
        itemLocalId?: string;
      }) => {
        return tr.split($from.pos, 1, [
          { type: nodeType, attrs: { localId: itemLocalId } },
        ]);
      };

      const insertTr = insertTaskDecisionWithAnalytics(
        state,
        listType,
        INPUT_METHOD.KEYBOARD,
        addItem,
      );

      if (insertTr && dispatch) {
        insertTr.scrollIntoView();
        dispatch(insertTr);
      }

      return true;
    },
  ),
);

export function keymapPlugin(schema: Schema): Plugin | undefined {
  const keymaps = {
    // always eat the keyboard event when pressing Shift-Tab
    'Shift-Tab': chainCommands(unindent, () => true),
    Tab: indent,

    Backspace: backspace,
    Delete: deleteForwards,

    Enter: enter,
  };
  return keymap(keymaps);
}

export default keymapPlugin;
