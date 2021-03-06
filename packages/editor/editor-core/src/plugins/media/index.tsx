import * as React from 'react';
import { MediaProvider } from '@atlaskit/editor-common';
import {
  media,
  mediaGroup,
  mediaSingle,
  mediaWithAltText,
} from '@atlaskit/adf-schema';
import {
  EditorPlugin,
  EditorAppearance,
  PMPluginFactoryParams,
} from '../../types';
import {
  stateKey as pluginKey,
  createPlugin,
  MediaState,
} from './pm-plugins/main';
import {
  createPlugin as createMediaEditorPlugin,
  pluginKey as mediaEditorPluginKey,
} from './pm-plugins/media-editor';
import { createPlugin as createMediaAltTextPlugin } from './pm-plugins/alt-text';
import keymapMediaAltTextPlugin from './pm-plugins/alt-text/keymap';
import keymapMediaSinglePlugin from './pm-plugins/keymap-media-single';
import keymapPlugin from './pm-plugins/keymap';
import linkingPlugin from './pm-plugins/linking';
import ToolbarMedia from './ui/ToolbarMedia';
import { ReactMediaGroupNode } from './nodeviews/mediaGroup';
import { ReactMediaSingleNode } from './nodeviews/mediaSingle';
import { CustomMediaPicker, MediaEditorState } from './types';
import { messages } from '../insert-block/ui/ToolbarInsertBlock';
import { floatingToolbar } from './toolbar';

import {
  addAnalytics,
  ACTION,
  ACTION_SUBJECT,
  INPUT_METHOD,
  EVENT_TYPE,
  ACTION_SUBJECT_ID,
} from '../analytics';
import { IconImages } from '../quick-insert/assets';
import WithPluginState from '../../ui/WithPluginState';
import MediaEditor from './ui/MediaEditor';
import { MediaPickerComponents } from './ui/MediaPicker';

export { MediaState, MediaProvider, CustomMediaPicker };
export { insertMediaSingleNode } from './utils/media-single';

export interface MediaOptions {
  provider?: Promise<MediaProvider>;
  allowMediaSingle?: boolean | MediaSingleOptions;
  allowMediaGroup?: boolean;
  customDropzoneContainer?: HTMLElement;
  customMediaPicker?: CustomMediaPicker;
  allowResizing?: boolean;
  allowResizingInTables?: boolean;
  allowAnnotation?: boolean;
  allowLinking?: boolean;
  // This enables the option to add an alt-text attribute to images contained in the Editor.
  UNSAFE_allowAltTextOnImages?: boolean;
}

export interface MediaSingleOptions {
  disableLayout?: boolean;
}

export interface MediaPMPluginOptions {
  allowLazyLoading?: boolean;
  allowBreakoutSnapPoints?: boolean;
  allowAdvancedToolBarOptions?: boolean;
  allowMediaSingleEditable?: boolean;
  allowRemoteDimensionsFetch?: boolean;
  allowDropzoneDropLine?: boolean;
  allowMarkingUploadsAsIncomplete?: boolean;
  fullWidthEnabled?: boolean;
  uploadErrorHandler?: (state: MediaState) => void;
  waitForMediaUpload?: boolean;
}

const mediaPlugin = (
  options?: MediaOptions,
  pluginOptions?: MediaPMPluginOptions,
  appearance?: EditorAppearance,
): EditorPlugin => ({
  name: 'media',

  nodes() {
    const {
      allowMediaGroup = true,
      allowMediaSingle = false,
      UNSAFE_allowAltTextOnImages = false,
    } = options || {};

    const mediaNode = UNSAFE_allowAltTextOnImages ? mediaWithAltText : media;

    return [
      { name: 'mediaGroup', node: mediaGroup },
      { name: 'mediaSingle', node: mediaSingle },
      { name: 'media', node: mediaNode },
    ].filter(node => {
      if (node.name === 'mediaGroup') {
        return allowMediaGroup;
      }

      if (node.name === 'mediaSingle') {
        return allowMediaSingle;
      }

      return true;
    });
  },

  pmPlugins() {
    const pmPlugins = [
      {
        name: 'media',
        plugin: ({
          schema,
          dispatch,
          eventDispatcher,
          providerFactory,
          errorReporter,
          portalProviderAPI,
          reactContext,
          dispatchAnalyticsEvent,
        }: PMPluginFactoryParams) =>
          createPlugin(
            schema,
            {
              providerFactory,
              nodeViews: {
                mediaGroup: ReactMediaGroupNode(
                  portalProviderAPI,
                  providerFactory,
                  pluginOptions && pluginOptions.allowLazyLoading,
                  appearance,
                ),
                mediaSingle: ReactMediaSingleNode(
                  portalProviderAPI,
                  eventDispatcher,
                  providerFactory,
                  options,
                  pluginOptions,
                  pluginOptions && pluginOptions.fullWidthEnabled,
                  dispatchAnalyticsEvent,
                ),
              },
              errorReporter,
              uploadErrorHandler:
                pluginOptions && pluginOptions.uploadErrorHandler,
              waitForMediaUpload:
                pluginOptions && pluginOptions.waitForMediaUpload,
              customDropzoneContainer:
                options && options.customDropzoneContainer,
              customMediaPicker: options && options.customMediaPicker,
              allowResizing: !!(options && options.allowResizing),
            },
            reactContext,
            dispatch,
            pluginOptions,
          ),
      },
      { name: 'mediaKeymap', plugin: () => keymapPlugin() },
    ];

    if (options && options.allowMediaSingle) {
      pmPlugins.push({
        name: 'mediaSingleKeymap',
        plugin: ({ schema }) => keymapMediaSinglePlugin(schema),
      });
    }

    if (options && options.allowAnnotation) {
      pmPlugins.push({ name: 'mediaEditor', plugin: createMediaEditorPlugin });
    }

    if (options && options.UNSAFE_allowAltTextOnImages) {
      pmPlugins.push({
        name: 'mediaAltText',
        plugin: createMediaAltTextPlugin,
      });
      pmPlugins.push({
        name: 'mediaAltTextKeymap',
        plugin: ({ schema }) => keymapMediaAltTextPlugin(schema),
      });
    }

    if (options && options.allowLinking) {
      pmPlugins.push({
        name: 'mediaLinking',
        plugin: ({ dispatch }: PMPluginFactoryParams) =>
          linkingPlugin(dispatch),
      });
    }

    return pmPlugins;
  },

  contentComponent({ editorView, eventDispatcher }) {
    // render MediaEditor separately because it doesn't depend on media plugin state
    // so we can utilise EventDispatcher-based rerendering
    const mediaEditor =
      options && options.allowAnnotation ? (
        <WithPluginState
          editorView={editorView}
          plugins={{ mediaEditorState: mediaEditorPluginKey }}
          eventDispatcher={eventDispatcher}
          render={({
            mediaEditorState,
          }: {
            mediaEditorState: MediaEditorState;
          }) => (
            <MediaEditor
              mediaEditorState={mediaEditorState}
              view={editorView}
            />
          )}
        />
      ) : null;

    return (
      <>
        <WithPluginState
          editorView={editorView}
          plugins={{
            mediaState: pluginKey,
          }}
          render={({ mediaState }) => (
            <MediaPickerComponents mediaState={mediaState} />
          )}
        />

        {mediaEditor}
      </>
    );
  },

  secondaryToolbarComponent({ editorView, eventDispatcher, disabled }) {
    return (
      <ToolbarMedia
        editorView={editorView}
        eventDispatcher={eventDispatcher}
        pluginKey={pluginKey}
        isDisabled={disabled}
        isReducedSpacing={true}
      />
    );
  },

  pluginsOptions: {
    quickInsert: ({ formatMessage }) => [
      {
        title: formatMessage(messages.filesAndImages),
        description: formatMessage(messages.filesAndImagesDescription),
        priority: 400,
        keywords: ['media', 'attachment'],
        icon: () => (
          <IconImages label={formatMessage(messages.filesAndImages)} />
        ),
        action(insert, state) {
          const pluginState = pluginKey.getState(state);
          pluginState.showMediaPicker();
          const tr = insert('');
          return addAnalytics(state, tr, {
            action: ACTION.OPENED,
            actionSubject: ACTION_SUBJECT.PICKER,
            actionSubjectId: ACTION_SUBJECT_ID.PICKER_CLOUD,
            attributes: { inputMethod: INPUT_METHOD.QUICK_INSERT },
            eventType: EVENT_TYPE.UI,
          });
        },
      },
    ],

    floatingToolbar: (state, intl, providerFactory) =>
      floatingToolbar(state, intl, {
        providerFactory,
        // appearance, // TODO: required?
        allowResizing: options && options.allowResizing,
        allowResizingInTables: options && options.allowResizingInTables,
        allowAnnotation: options && options.allowAnnotation,
        allowLinking: options && options.allowLinking,
        allowAdvancedToolBarOptions:
          pluginOptions && pluginOptions.allowAdvancedToolBarOptions,
        UNSAFE_allowAltTextOnImages:
          options && options.UNSAFE_allowAltTextOnImages,
      }),
  },
});

export default mediaPlugin;
