import { Plugin, PluginKey, EditorState } from 'prosemirror-state';
import { EditorPlugin, EditorProps } from '../../types';

export const pluginKey = new PluginKey('sharedContextPlugin');

const sharedContextPlugin = (props: EditorProps): EditorPlugin => ({
  name: 'sharedContext',
  pmPlugins() {
    return [
      {
        name: 'sharedContextPlugin',
        plugin: () =>
          new Plugin({
            key: pluginKey,
            state: {
              init: (): { props: EditorProps } => ({ props }),
              apply: (_, pluginState) => pluginState,
            },
          }),
      },
    ];
  },
});

export const getEditorProps = (state: EditorState): EditorProps =>
  pluginKey.getState(state).props;

export default sharedContextPlugin;
