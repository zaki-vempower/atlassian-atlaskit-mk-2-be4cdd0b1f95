import {
  getAdministrationLinks,
  getAvailableProductLinks,
  getCustomLinkItems,
  getFixedProductLinks,
  getProvisionedProducts,
  getRecentLinkItems,
  getSuggestedProductLink,
  getDiscoverSectionLinks,
  getJoinableSiteLinks,
  SwitcherItemType,
} from './links';
import {
  hasLoaded,
  isComplete,
  isError,
  ProviderResult,
  Status,
} from '../providers/as-data-provider';
import {
  AvailableProductsResponse,
  CustomLinksResponse,
  FeatureMap,
  Product,
  RecentContainersResponse,
  RecommendationsEngineResponse,
  UserSiteDataResponse,
  JoinableSitesResponse,
} from '../types';
import { JoinableSiteItemType } from './links';
import { createCollector } from './create-collector';

function collectAvailableProductLinks(
  cloudId: string | null | undefined,
  availableProducts?: ProviderResult<AvailableProductsResponse>,
): SwitcherItemType[] | undefined {
  if (availableProducts) {
    if (isError(availableProducts)) {
      throw availableProducts.error;
    }
    if (isComplete(availableProducts)) {
      return getAvailableProductLinks(availableProducts.data, cloudId);
    }
    return;
  }
  return;
}

function collectSuggestedLinks(
  userSiteData: ProviderResult<UserSiteDataResponse>,
  productRecommendations: ProviderResults['productRecommendations'],
  isXFlowEnabled: ProviderResults['isXFlowEnabled'],
  isDiscoverSectionEnabled?: boolean,
) {
  if (isError(isXFlowEnabled) || isError(userSiteData)) {
    return [];
  }
  if (
    isComplete(userSiteData) &&
    isComplete(isXFlowEnabled) &&
    isComplete(productRecommendations)
  ) {
    return isXFlowEnabled.data
      ? getSuggestedProductLink(
          userSiteData.data.provisionedProducts,
          productRecommendations.data,
          isDiscoverSectionEnabled,
        )
      : [];
  }
}

function collectCanManageLinks(
  managePermission: ProviderResults['managePermission'],
) {
  if (isComplete(managePermission)) {
    return managePermission.data;
  }
}

function collectAdminLinks(
  managePermission: ProviderResults['managePermission'],
  addProductsPermission: ProviderResults['addProductsPermission'],
  isDiscoverMoreForEveryoneEnabled: boolean,
  isEmceeLinkEnabled: boolean,
  product?: Product,
  isDiscoverSectionEnabled?: boolean,
) {
  if (isError(managePermission) || isError(addProductsPermission)) {
    return [];
  }

  if (isComplete(managePermission) && isComplete(addProductsPermission)) {
    if (managePermission.data || addProductsPermission.data) {
      return getAdministrationLinks(
        managePermission.data,
        isDiscoverMoreForEveryoneEnabled,
        isEmceeLinkEnabled,
        product,
        isDiscoverSectionEnabled,
      );
    }

    return [];
  }
}

function collectDiscoverSectionLinks(
  managePermission: ProviderResults['managePermission'],
  addProductsPermission: ProviderResults['addProductsPermission'],
  isDiscoverMoreForEveryoneEnabled: boolean,
  isEmceeLinkEnabled: boolean,
  product?: Product,
) {
  const canManagePermission =
    !isError(managePermission) &&
    isComplete(managePermission) &&
    managePermission.data;

  const canAddProducts =
    !isError(addProductsPermission) &&
    isComplete(addProductsPermission) &&
    addProductsPermission.data;

  return getDiscoverSectionLinks({
    isDiscoverMoreForEveryoneEnabled,
    isEmceeLinkEnabled,
    product,
    canManagePermission,
    canAddProducts,
  });
}

function collectFixedProductLinks(
  isDiscoverMoreForEveryoneEnabled: boolean,
): SwitcherItemType[] {
  return getFixedProductLinks({
    isDiscoverMoreForEveryoneEnabled,
  });
}

function collectRecentLinks(
  recentContainers: ProviderResults['recentContainers'],
  userSiteData: ProviderResult<UserSiteDataResponse>,
) {
  if (isError(recentContainers) || isError(userSiteData)) {
    return [];
  }

  if (isComplete(recentContainers) && isComplete(userSiteData)) {
    return getRecentLinkItems(
      recentContainers.data.data,
      userSiteData.data.currentSite,
    );
  }
}

function collectCustomLinks(
  customLinks: ProviderResults['customLinks'],
  userSiteData: ProviderResult<UserSiteDataResponse>,
) {
  if (customLinks === undefined || isError(userSiteData)) {
    return [];
  }

  if (isComplete(customLinks) && isComplete(userSiteData)) {
    return getCustomLinkItems(customLinks.data, userSiteData.data.currentSite);
  }
}

function collectJoinableSiteLinks(
  joinableSites: ProviderResults['joinableSiteLinks'],
): JoinableSiteItemType[] | undefined {
  if (joinableSites === undefined || isError(joinableSites)) {
    return [];
  }

  if (isComplete(joinableSites)) {
    return getJoinableSiteLinks(joinableSites.data.sites);
  }
}

interface ProviderResults {
  joinableSiteLinks?: ProviderResult<JoinableSitesResponse>;
  customLinks?: ProviderResult<CustomLinksResponse>;
  recentContainers: ProviderResult<RecentContainersResponse>;
  managePermission: ProviderResult<boolean>;
  addProductsPermission: ProviderResult<boolean>;
  isXFlowEnabled: ProviderResult<boolean>;
  productRecommendations: ProviderResult<RecommendationsEngineResponse>;
}

function isTenantless(product: Product) {
  return [Product.BITBUCKET, Product.TRELLO].includes(product);
}

function asUserSiteDataProviderResult(
  availableProductsProvider: ProviderResult<AvailableProductsResponse>,
  cloudId: string | null | undefined,
  product: Product | null | undefined,
): ProviderResult<UserSiteDataResponse> {
  switch (availableProductsProvider.status) {
    case Status.LOADING: // intentional fallthrough
    case Status.ERROR:
      return availableProductsProvider;
    case Status.COMPLETE:
      const site = availableProductsProvider.data.sites.find(
        site =>
          (cloudId && site.cloudId === cloudId) ||
          (product &&
            isTenantless(product) &&
            isTenantless(site.cloudId as Product)),
      );

      if (!site) {
        return {
          status: Status.ERROR,
          data: null,
          error: new Error(
            `could not find site in availableProducts for cloudId ${cloudId}`,
          ),
        };
      }
      return {
        status: Status.COMPLETE,
        data: {
          currentSite: {
            url: site.url,
            products: site.availableProducts,
          },
          provisionedProducts: getProvisionedProducts(
            availableProductsProvider.data,
          ),
        },
      };
  }
}

export function mapResultsToSwitcherProps(
  cloudId: string | null | undefined,
  results: ProviderResults,
  features: FeatureMap,
  availableProducts: ProviderResult<AvailableProductsResponse>,
  joinableSites: ProviderResult<JoinableSitesResponse>,
  product?: Product,
) {
  const collect = createCollector();

  const {
    isXFlowEnabled,
    managePermission,
    addProductsPermission,
    customLinks,
    recentContainers,
    productRecommendations,
  } = results;
  const userSiteData = asUserSiteDataProviderResult(
    availableProducts,
    cloudId,
    product,
  );
  const hasLoadedAvailableProducts = hasLoaded(availableProducts);
  const hasLoadedAdminLinks =
    hasLoaded(managePermission) && hasLoaded(addProductsPermission);
  const hasLoadedSuggestedProducts = features.xflow
    ? hasLoaded(productRecommendations) && hasLoaded(isXFlowEnabled)
    : true;
  const hasLoadedDiscoverSection =
    features.isDiscoverSectionEnabled &&
    hasLoadedAvailableProducts &&
    hasLoadedSuggestedProducts &&
    hasLoadedAdminLinks;

  const hasLoadedJoinableSites = hasLoaded(joinableSites);

  return {
    licensedProductLinks: collect(
      collectAvailableProductLinks(cloudId, availableProducts),
      [],
    ),
    suggestedProductLinks: features.xflow
      ? collect(
          collectSuggestedLinks(
            userSiteData,
            productRecommendations,
            isXFlowEnabled,
            features.isDiscoverSectionEnabled,
          ),
          [],
        )
      : [],
    fixedLinks: !features.isDiscoverSectionEnabled
      ? collect(
          collectFixedProductLinks(features.isDiscoverMoreForEveryoneEnabled),
          [],
        )
      : [],
    adminLinks: collect(
      collectAdminLinks(
        managePermission,
        addProductsPermission,
        features.isDiscoverMoreForEveryoneEnabled,
        features.isEmceeLinkEnabled,
        product,
        features.isDiscoverSectionEnabled,
      ),
      [],
    ),
    joinableSiteLinks: collect(collectJoinableSiteLinks(joinableSites), []),
    recentLinks: collect(
      collectRecentLinks(recentContainers, userSiteData),
      [],
    ),
    customLinks: collect(collectCustomLinks(customLinks, userSiteData), []),
    showManageLink:
      !features.disableCustomLinks &&
      collect(collectCanManageLinks(managePermission), false),
    hasLoaded:
      hasLoadedAvailableProducts &&
      hasLoadedAdminLinks &&
      hasLoadedSuggestedProducts &&
      hasLoadedJoinableSites,
    hasLoadedCritical: hasLoadedAvailableProducts,
    discoverSectionLinks: hasLoadedDiscoverSection
      ? collect(
          collectDiscoverSectionLinks(
            managePermission,
            addProductsPermission,
            features.isDiscoverMoreForEveryoneEnabled,
            features.isEmceeLinkEnabled,
            product,
          ),
          [],
        )
      : [],
  };
}
