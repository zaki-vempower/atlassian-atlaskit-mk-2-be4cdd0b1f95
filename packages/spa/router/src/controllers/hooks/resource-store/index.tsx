import { useCallback } from 'react';

import {
  RouteResource,
  RouteResourceResponse,
  RouteResourceData,
} from '../../../common/types';
import { useResourceStore, useResourceActions } from '../../resource-store';
import { getRouterState } from '../../router-store';

type UseResourceHookResponse<
  D = RouteResourceResponse['data']
> = RouteResourceResponse & {
  data: D;
  update: (data: RouteResourceData | null) => void;
  refresh: () => void;
};

/**
 * Utility hook for using a resource. Will throw a promise if we are using suspense.
 *
 */
export const useResource = (
  resource: RouteResource,
): UseResourceHookResponse[] => {
  /**
   * @gasparin - We may need to use a hook to get the router so that components using this hook
   * will respond to route changes, so something like
   *
   * const [router] = useRouterStore()
   */
  const { route, match, query, location } = getRouterState();
  const { type, getKey, maxAge } = resource;
  const [, actions] = useResourceActions();
  const key = getKey({ match, query, route, location }, actions.getContext());
  const [slice] = useResourceStore({
    type,
    key,
  });

  return [
    {
      ...slice,
      update: useCallback(
        (newData: RouteResourceData | null) => {
          actions.updateResourceState(type, key, maxAge, newData);
        },
        [actions, type, key, maxAge],
      ),
      refresh: useCallback(() => {
        actions.getResourceFromRemote(resource, {
          route,
          match,
          query,
          location,
        });
      }, [actions, resource, route, match, query, location]),
    },
  ];
};
