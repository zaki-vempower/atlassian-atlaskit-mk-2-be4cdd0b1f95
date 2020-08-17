import styled, { css } from 'styled-components';
import { colors, gridSize, fontSize } from '@atlaskit/theme';

import {
  akEditorSelectedBorder,
  akEditorSelectedBorderSize,
  akEditorSwoopCubicBezier,
  blockNodesVerticalMargin,
  akLayoutGutterOffset,
} from '../../styles';

export const messages = {
  expandNode: {
    id: 'fabric.editor.expandNode',
    defaultMessage: 'Expand content',
    description: 'Expand the node',
  },
  collapseNode: {
    id: 'fabric.editor.collapseNode',
    defaultMessage: 'Collapse content',
    description: 'Collapse the node',
  },
};

const BORDER_RADIUS = gridSize() / 2;
const EXPAND_SELECTED_BACKGROUND = 'rgba(255, 255, 255, 0.6)';

export interface StyleProps {
  expanded?: boolean;
  'data-node-type'?: 'expand' | 'nestedExpand';
  'data-title'?: string;
}

export const ExpandIconWrapper = styled.div<{ expanded: boolean }>`
  cursor: pointer;
  display: flex;
  color: ${colors.N90};
  border-radius: ${gridSize() / 2}px;
  width: 24px;
  height: 24px;

  &:hover {
    background: ${colors.N30A};
  }

  svg {
    ${props => (props.expanded ? 'transform: rotate(90deg);' : '')}
    transition: transform 0.2s ${akEditorSwoopCubicBezier};
  }
`;

export const ExpandLayoutWrapper = styled.div`
  width: ${gridSize() * 3}px;
  height: ${gridSize() * 3}px;
`;

const ContainerStyles = css<StyleProps>`
  border-width: 1px;
  border-style: solid;
  border-color: ${({ expanded }) => (!expanded ? 'transparent' : colors.N40A)};
  border-radius: ${BORDER_RADIUS}px;
  min-height: 25px;
  background: ${({ expanded }) =>
    !expanded ? 'transparent' : EXPAND_SELECTED_BACKGROUND};
  margin: ${props =>
    `${blockNodesVerticalMargin}rem ${
      // Only only these margins if the expand isn't editable
      // and is the root level expand.
      props['data-node-type'] === 'expand' ? `-${akLayoutGutterOffset}px` : `0`
    } 0`};

  transition: background 0.3s ${akEditorSwoopCubicBezier};
  padding: ${gridSize}px;

  &:hover {
    border: 1px solid ${colors.N50A};
    background: ${EXPAND_SELECTED_BACKGROUND};
  }

  &.ProseMirror-selectednode {
    border-color: transparent;
    background: ${colors.B50};
    box-shadow: 0 0 0 ${akEditorSelectedBorderSize}px ${akEditorSelectedBorder};
  }

  &.danger {
    border-color: transparent;
    background: ${colors.R50};
    box-shadow: 0 0 0 ${akEditorSelectedBorderSize}px ${colors.R300};
  }

  td > &:first-child {
    margin-top: 0;
  }
`;

const ContentStyles = css<StyleProps>`
  ${({ expanded }) => {
    return `
    padding-top: ${expanded ? gridSize() : 0}px;
    padding-right: ${gridSize()}px;
    padding-left: ${gridSize() * 4 - gridSize() / 2}px;
    display: table;
    display: flow-root;

    ${
      !expanded
        ? `
      .expand-content-wrapper, .nestedExpand-content-wrapper {
        /* We visually hide the content here to preserve the content during copy+paste */
        position: absolute;
        height: 1px;
        width: 1px;
        overflow: hidden;
        clip: rect(1px, 1px, 1px, 1px);
        white-space: nowrap;
        user-select: none;
      }
    `
        : ''
    }
    `;
  }};
`;

const TitleInputStyles = `
  outline: none;
  border: none;
  font-size: ${fontSize()}px;
  line-height: 1.714;
  font-weight: normal;
  color: ${colors.N200A};
  background: transparent;
  display: flex;
  flex: 1;
  padding: 0 0 0 ${gridSize() / 2}px;
  width: 100%;

  &::placeholder {
    opacity: 0.6;
    color: ${colors.N200A};
  }
`;

const TitleContainerStyles = `
  padding: 0;
  display: flex;
  align-items: flex-start;
  background: none;
  border: none;
  font-size: ${fontSize()}px;
  width: 100%;
  color: ${colors.N300A};
  overflow: hidden;
  cursor: pointer;
  // Prevent browser selection being inside the title container
  user-select: none;

  /* TODO: Fix outline for keyboard navigation */
  &:focus {
    outline: 0;
  }
`;

export const sharedExpandStyles = {
  TitleInputStyles,
  TitleContainerStyles,
  ContainerStyles,
  ContentStyles,
};
