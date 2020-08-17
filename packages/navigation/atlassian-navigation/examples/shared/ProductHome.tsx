import {
  BitbucketIcon,
  BitbucketLogo,
  ConfluenceIcon,
  ConfluenceLogo,
  JiraIcon,
  JiraLogo,
  JiraServiceDeskIcon,
  JiraServiceDeskLogo,
  JiraSoftwareIcon,
  JiraSoftwareLogo,
  OpsGenieIcon,
  OpsGenieLogo,
} from '@atlaskit/logo';
import React from 'react';

import { CustomProductHome, ProductHome } from '../../src';

import atlassianIconUrl from './assets/atlassian-icon.png';
import atlassianLogoUrl from './assets/atlassian-logo.png';

export const BitbucketProductHome = () => (
  <ProductHome
    onClick={console.log}
    siteTitle="Extranet"
    icon={BitbucketIcon}
    logo={BitbucketLogo}
  />
);

export const ConfluenceProductHome = () => (
  <ProductHome
    siteTitle="Extranet"
    icon={ConfluenceIcon}
    logo={ConfluenceLogo}
    href="#"
  />
);

export const JiraProductHome = () => (
  <ProductHome
    onClick={console.log}
    siteTitle="Extranet"
    icon={JiraIcon}
    logo={JiraLogo}
  />
);

export const JiraServiceDeskProductHome = () => (
  <ProductHome
    siteTitle="Extranet"
    icon={JiraServiceDeskIcon}
    logo={JiraServiceDeskLogo}
    href="#"
  />
);

export const JiraSoftwareProductHome = () => (
  <ProductHome
    siteTitle="Extranet"
    icon={JiraSoftwareIcon}
    logo={JiraSoftwareLogo}
    href="#"
  />
);

export const OpsGenieProductHome = () => (
  <ProductHome
    siteTitle="Extranet"
    onClick={console.log}
    icon={OpsGenieIcon}
    logo={OpsGenieLogo}
  />
);

export const DefaultProductHome = JiraProductHome;

export const DefaultCustomProductHome = () => (
  <CustomProductHome
    href="#"
    siteTitle="Extranet"
    iconAlt="Custom icon"
    iconUrl={atlassianIconUrl}
    logoAlt="Custom logo"
    logoUrl={atlassianLogoUrl}
  />
);
