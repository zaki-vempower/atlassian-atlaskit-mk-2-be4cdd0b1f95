import React from 'react';
import { InjectedIntl } from 'react-intl';
import { EditorView } from 'prosemirror-view';
import {
  FloatingToolbarButton,
  FloatingToolbarCustom,
  FloatingToolbarConfig,
} from '../../floating-toolbar/types';
import { Command } from '../../../types';
import { openMediaAltTextMenu } from '../pm-plugins/alt-text/commands';
import * as keymaps from '../../../keymaps';
import { MediaToolbarBaseConfig } from '../types';
import { messages } from '../pm-plugins/alt-text/messages';
import AltTextEdit from '../pm-plugins/alt-text/ui/AltTextEdit';
import { CONTAINER_WIDTH_IN_PX } from '../pm-plugins/alt-text/ui/AltTextEdit';
import { getMediaNodeFromSelection } from '../utils/media-common';
import { EditorState } from 'prosemirror-state';

export const altTextButton = (
  intl: InjectedIntl,
  state: EditorState,
): FloatingToolbarButton<Command> => {
  const mediaNode = getMediaNodeFromSelection(state);
  const message =
    mediaNode && mediaNode.attrs.alt ? messages.editAltText : messages.altText;
  const title = intl.formatMessage(message);
  return {
    title,
    type: 'button',
    onClick: openMediaAltTextMenu,
    showTitle: true,
    tooltipContent: keymaps.renderTooltipContent(title, keymaps.addAltText),
  };
};

export const altTextEditComponent = (): FloatingToolbarCustom => {
  return {
    type: 'custom',
    render: (view?: EditorView, idx?: number) => {
      if (!view) {
        return null;
      }

      const mediaNode = getMediaNodeFromSelection(view.state);

      if (!mediaNode) {
        return null;
      }

      return <AltTextEdit view={view} key={idx} value={mediaNode.attrs.alt} />;
    },
  };
};

export const getAltTextToolbar = (
  toolbarBaseConfig: MediaToolbarBaseConfig,
): FloatingToolbarConfig => {
  return {
    ...toolbarBaseConfig,
    width: CONTAINER_WIDTH_IN_PX,
    items: [altTextEditComponent()],
  };
};
