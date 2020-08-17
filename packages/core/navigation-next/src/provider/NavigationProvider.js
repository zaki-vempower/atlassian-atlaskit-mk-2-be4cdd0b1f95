// @flow

import React, { Component } from 'react';
import { Provider } from 'unstated';

import { CONTENT_NAV_WIDTH } from '../common/constants';
import { UIController } from '../ui-controller';
import type { UIControllerCacheShape } from '../ui-controller/types';
import { ViewController } from '../view-controller';

import type { NavigationProviderProps } from './types';

const LS_KEY = 'ATLASKIT_NAVIGATION_UI_STATE';

const DEFAULT_UI_STATE = {
  isCollapsed: false,
  productNavWidth: CONTENT_NAV_WIDTH,
  isResizeDisabled: false,
};

function defaultGetCache(): UIControllerCacheShape {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(LS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_UI_STATE;
  }
  return DEFAULT_UI_STATE;
}

function defaultSetCache(state: UIControllerCacheShape) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }
}

export default class NavigationProvider extends Component<NavigationProviderProps> {
  static defaultProps = {
    cache: {
      get: defaultGetCache,
      set: defaultSetCache,
    },
    isDebugEnabled: false,
  };

  uiState: UIController;

  viewController: ViewController;

  constructor(props: NavigationProviderProps) {
    super(props);

    const { cache, initialUIController, isDebugEnabled } = props;
    this.uiState = new UIController(initialUIController, cache);
    this.viewController = new ViewController({ isDebugEnabled });
  }

  componentDidUpdate(prevProps: NavigationProviderProps) {
    const { viewController } = this;
    const { isDebugEnabled } = this.props;
    if (isDebugEnabled !== prevProps.isDebugEnabled) {
      viewController.setIsDebugEnabled(!!isDebugEnabled);
    }
  }

  render() {
    const { children } = this.props;
    const { uiState, viewController } = this;

    return <Provider inject={[uiState, viewController]}>{children}</Provider>;
  }
}
