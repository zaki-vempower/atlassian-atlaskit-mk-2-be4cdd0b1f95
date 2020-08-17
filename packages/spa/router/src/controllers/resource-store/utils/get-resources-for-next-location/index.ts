import {
  RouteResource,
  RouterStoreContext,
  ResourceStoreContext,
} from '../../../../common/types';
import {
  getResourceIdentifiers,
  getResourceIdentifier,
} from '../get-resource-identifier';
import { routeHasChanged, routeHasResources } from '../route-checks';

/**
 * Gets the requestable resources for the next location.
 *
 */
export const getResourcesForNextLocation = (
  prevRouterStoreContext: RouterStoreContext,
  nextRouterStoreContext: RouterStoreContext,
  resourceStoreContext: ResourceStoreContext,
): RouteResource[] => {
  const { route: prevRoute } = prevRouterStoreContext;
  const { resources: prevResources = [] } = prevRoute || {};
  const { route: nextRoute } = nextRouterStoreContext;
  const { resources: nextResources = [] } = nextRoute || {};

  if (!routeHasResources(nextRoute)) {
    return [];
  }

  if (routeHasChanged(prevRoute, nextRoute)) {
    return nextResources;
  }

  const prevResourceIdentifiers = getResourceIdentifiers(
    prevResources,
    prevRouterStoreContext,
    resourceStoreContext,
  );

  return nextResources.filter(
    resource =>
      !prevResourceIdentifiers.includes(
        getResourceIdentifier(
          resource,
          nextRouterStoreContext,
          resourceStoreContext,
        ),
      ),
  );
};
