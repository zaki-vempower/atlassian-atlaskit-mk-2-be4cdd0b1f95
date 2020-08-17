import {
  compareSelection,
  createEditorFactory,
  doc,
  p,
  sendKeyToPm,
  taskList,
  taskItem,
  testKeymap,
} from '@atlaskit/editor-test-helpers';
import { uuid } from '@atlaskit/adf-schema';
import {
  CreateUIAnalyticsEvent,
  UIAnalyticsEvent,
} from '@atlaskit/analytics-next';
import { MockMentionResource } from '@atlaskit/util-data-test';
import { ListTypes } from './_helpers';

describe('tasks and decisions - keymaps', () => {
  const createEditor = createEditorFactory();

  let createAnalyticsEvent: CreateUIAnalyticsEvent;

  beforeEach(() => {
    uuid.setStatic('local-uuid');
  });

  afterEach(() => {
    uuid.setStatic(false);
  });

  const editorFactory = (doc: any) => {
    createAnalyticsEvent = jest.fn(() => ({ fire() {} } as UIAnalyticsEvent));
    return createEditor({
      doc,
      editorProps: {
        allowAnalyticsGASV3: true,
        allowTables: true,
        allowTasksAndDecisions: true,
        mentionProvider: Promise.resolve(new MockMentionResource({})),
        allowNestedTasks: true,
      },
      createAnalyticsEvent,
    });
  };

  describe.each(ListTypes)('%s', (name, list, item, listProps, itemProps) => {
    describe('Enter', () => {
      describe(`when ${name}List is empty`, () => {
        it('should remove decisionList and replace with paragraph', () => {
          const { editorView } = editorFactory(
            doc(list(listProps)(item(itemProps)('{<>}'))),
          );

          sendKeyToPm(editorView, 'Enter');
          const expectedDoc = doc(p('{<>}'));
          expect(editorView.state.doc).toEqualDocument(expectedDoc);
          compareSelection(editorFactory, expectedDoc, editorView);
        });
      });

      describe(`when cursor is at the end of empty ${name}Item`, () => {
        it(`should remove ${name}Item and insert a paragraph after`, () => {
          const { editorView } = editorFactory(
            doc(
              p('before'),
              list(listProps)(
                item(itemProps)('Hello World'),
                item(itemProps)('{<>}'),
              ),
              p('after'),
            ),
          );

          sendKeyToPm(editorView, 'Enter');

          const expectedDoc = doc(
            p('before'),
            list(listProps)(item(itemProps)('Hello World')),
            p('{<>}'),
            p('after'),
          );

          expect(editorView.state.doc).toEqualDocument(expectedDoc);
          compareSelection(editorFactory, expectedDoc, editorView);
        });

        it(`should remove ${name}Item and insert a paragraph before`, () => {
          const { editorView } = editorFactory(
            doc(
              p('before'),
              list(listProps)(
                item(itemProps)('{<>}'),
                item(itemProps)('Hello World'),
              ),
              p('after'),
            ),
          );

          sendKeyToPm(editorView, 'Enter');

          const expectedDoc = doc(
            p('before'),
            p('{<>}'),
            list(listProps)(item(itemProps)('Hello World')),
            p('after'),
          );
          expect(editorView.state.doc).toEqualDocument(expectedDoc);
          compareSelection(editorFactory, expectedDoc, editorView);
        });

        it(`should split ${name}List and insert a paragraph when in middle`, () => {
          const { editorView } = editorFactory(
            doc(
              p('before'),
              list(listProps)(
                item(itemProps)('Hello World'),
                item(itemProps)('{<>}'),
                item(itemProps)('Goodbye World'),
              ),
              p('after'),
            ),
          );

          sendKeyToPm(editorView, 'Enter');

          const expectedDoc = doc(
            p('before'),
            list(listProps)(item(itemProps)('Hello World')),
            p('{<>}'),
            list(listProps)(item(itemProps)('Goodbye World')),
            p('after'),
          );
          expect(editorView.state.doc).toEqualDocument(expectedDoc);
          compareSelection(editorFactory, expectedDoc, editorView);
        });
      });

      describe(`when cursor is at the end of non-empty ${name}Item`, () => {
        it(`should insert another ${name}Item`, () => {
          const { editorView } = editorFactory(
            doc(list(listProps)(item(itemProps)('Hello World{<>}'))),
          );

          sendKeyToPm(editorView, 'Enter');

          const expectedDoc = doc(
            list(listProps)(
              item(itemProps)('Hello World'),
              item(itemProps)('{<>}'),
            ),
          );

          expect(editorView.state.doc).toEqualDocument(expectedDoc);
          compareSelection(editorFactory, expectedDoc, editorView);
        });

        it(`should insert another ${name}Item when in middle of list`, () => {
          const { editorView } = editorFactory(
            doc(
              list(listProps)(
                item(itemProps)('Hello World{<>}'),
                item(itemProps)('Goodbye World'),
              ),
            ),
          );

          sendKeyToPm(editorView, 'Enter');

          const expectedDoc = doc(
            list(listProps)(
              item(itemProps)('Hello World'),
              item(itemProps)('{<>}'),
              item(itemProps)('Goodbye World'),
            ),
          );

          expect(editorView.state.doc).toEqualDocument(expectedDoc);
          compareSelection(editorFactory, expectedDoc, editorView);
        });
      });

      describe(`when cursor is at the start of a non-empty ${name}Item`, () => {
        it(`should insert another ${name}Item above`, () => {
          const initialDoc = doc(
            list(listProps)(item(itemProps)('{<>}Hello World')),
          );
          const { editorView } = editorFactory(initialDoc);

          sendKeyToPm(editorView, 'Enter');

          expect(editorView.state).toEqualDocumentAndSelection(
            doc(
              list(listProps)(
                item(itemProps)(''),
                item(itemProps)('{<>}Hello World'),
              ),
            ),
          );
        });
      });

      it(`should fire v3 analytics event when insert ${name}`, () => {
        const { editorView } = editorFactory(
          doc(list(listProps)(item(itemProps)('Hello World{<>}'))),
        );

        sendKeyToPm(editorView, 'Enter');

        expect(createAnalyticsEvent).toBeCalledWith(
          expect.objectContaining({
            action: 'inserted',
            actionSubject: 'document',
            actionSubjectId: name,
            attributes: expect.objectContaining({ inputMethod: 'keyboard' }),
            eventType: 'track',
          }),
        );
      });
    });
  });

  // indentation-specific tests
  describe('action', () => {
    const listProps = { localId: 'local-uuid' };
    const itemProps = { localId: 'local-uuid', state: 'TODO' };

    describe('Enter', () => {
      it('creates another taskItem at the currently nested level', () => {
        testKeymap(
          editorFactory,
          doc(
            taskList(listProps)(
              taskItem(itemProps)('Top level'),
              taskList(listProps)(taskItem(itemProps)('Nested one level{<>}')),
            ),
          ),

          doc(
            taskList(listProps)(
              taskItem(itemProps)('Top level'),
              taskList(listProps)(
                taskItem(itemProps)('Nested one level'),
                taskItem(itemProps)('{<>}'),
              ),
            ),
          ),

          ['Enter'],
        );
      });

      it('creates new taskItem in between nested taskItems', () => {
        testKeymap(
          editorFactory,
          doc(
            taskList(listProps)(
              taskItem(itemProps)('Top level'),
              taskList(listProps)(
                taskItem(itemProps)('Nested one level{<>}'),
                taskItem(itemProps)('Nested one level'),
              ),
            ),
          ),

          doc(
            taskList(listProps)(
              taskItem(itemProps)('Top level'),
              taskList(listProps)(
                taskItem(itemProps)('Nested one level'),
                taskItem(itemProps)('{<>}'),
                taskItem(itemProps)('Nested one level'),
              ),
            ),
          ),

          ['Enter'],
        );
      });

      it('unindents when the nested taskItem is empty', () => {
        testKeymap(
          editorFactory,
          doc(
            taskList(listProps)(
              taskItem(itemProps)('Top level'),
              taskList(listProps)(
                taskItem(itemProps)('Nested one level'),
                taskItem(itemProps)('{<>}'),
              ),
            ),
          ),

          doc(
            taskList(listProps)(
              taskItem(itemProps)('Top level'),
              taskList(listProps)(taskItem(itemProps)('Nested one level')),
              taskItem(itemProps)('{<>}'),
            ),
          ),

          ['Enter'],
        );
      });

      it('unindents taskItem nested between two others', () => {
        testKeymap(
          editorFactory,
          doc(
            taskList(listProps)(
              taskItem(itemProps)('Top level'),
              taskList(listProps)(
                taskItem(itemProps)('Nested one level'),
                taskItem(itemProps)('{<>}'),
                taskItem(itemProps)('Nested one level'),
              ),
            ),
          ),

          doc(
            taskList(listProps)(
              taskItem(itemProps)('Top level'),
              taskList(listProps)(taskItem(itemProps)('Nested one level')),
              taskItem(itemProps)('{<>}'),
              taskList(listProps)(taskItem(itemProps)('Nested one level')),
            ),
          ),

          ['Enter'],
        );
      });

      it('unindents taskItem and pulls nested with it', () => {
        testKeymap(
          editorFactory,
          doc(
            taskList(listProps)(
              taskItem(itemProps)('Top level'),
              taskList(listProps)(
                taskItem(itemProps)('Second level level'),
                taskList(listProps)(taskItem(itemProps)('Nested two level')),
                taskItem(itemProps)('{<>}'),
                taskList(listProps)(taskItem(itemProps)('Nested two level')),
              ),
            ),
          ),

          doc(
            taskList(listProps)(
              taskItem(itemProps)('Top level'),
              taskList(listProps)(
                taskItem(itemProps)('Second level level'),
                taskList(listProps)(taskItem(itemProps)('Nested two level')),
              ),
              taskItem(itemProps)('{<>}'),
              taskList(listProps)(taskItem(itemProps)('Nested two level')),
            ),
          ),

          ['Enter'],
        );
      });
    });
  });
});
