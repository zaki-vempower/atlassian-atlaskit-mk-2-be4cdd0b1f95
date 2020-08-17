import React, { ReactNode } from 'react';
import { BoundActions } from 'react-sweet-state';

import { RouterSubscriber as BaseRouterSubscriber } from '../../router-store';
import {
  RouterState,
  RouterActionsType,
  EntireRouterState,
} from '../../router-store/types';

type Props = {
  children: (
    state: RouterState,
    actions: BoundActions<EntireRouterState, RouterActionsType>,
  ) => ReactNode;
};

export const RouterSubscriber = ({ children }: Props) => (
  <BaseRouterSubscriber>
    {(state, { bootstrapStore, listen, ...actions }) => {
      if (!state.unlisten && !state.isStatic) {
        listen();
      }

      return children(state, actions);
    }}
  </BaseRouterSubscriber>
);
