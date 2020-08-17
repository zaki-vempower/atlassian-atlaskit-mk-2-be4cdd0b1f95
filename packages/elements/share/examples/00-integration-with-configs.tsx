import * as React from 'react';
import { IntlProvider } from 'react-intl';
import styled from 'styled-components';
import Select from '@atlaskit/select';
import { ToggleStateless as Toggle } from '@atlaskit/toggle';
import { OptionData } from '@atlaskit/user-picker';
import { userPickerData } from '@atlaskit/util-data-test';
import { ButtonAppearances } from '@atlaskit/button';

import App from '../example-helpers/AppWithFlag';
import RestrictionMessage from '../example-helpers/RestrictionMessage';
import { ProductName, ShareDialogContainer } from '../src';
import {
  Comment,
  ConfigResponse,
  ConfigResponseMode,
  Content,
  DialogPlacement,
  KeysOfType,
  MetaData,
  OriginTracing,
  RenderCustomTriggerButton,
  ShareButtonStyle,
  ShareClient,
  ShareResponse,
  TooltipPosition,
  User,
} from '../src/types';
import {
  ShortenResponse,
  UrlShortenerClient,
} from '../src/clients/AtlassianUrlShortenerClient';

type UserData = {
  avatarUrl?: string;
  id: string;
  includesYou?: boolean;
  fixed?: boolean;
  lozenge?: string;
  memberCount?: number;
  name: string;
  publicName?: string;
  type?: string;
};

const WrapperWithMarginTop = styled.div`
  margin-top: 10px;
`;

let factoryCount = 0;
function originTracingFactory(): OriginTracing {
  factoryCount++;
  const id = `id#${factoryCount}`;
  return {
    id,
    addToUrl: (l: string) => `${l}&atlOrigin=mockAtlOrigin:${id}`,
    toAnalyticsAttributes: () => ({
      originIdGenerated: id,
      originProduct: 'product',
    }),
  };
}

const loadUserOptions = (searchText?: string): OptionData[] => {
  if (!searchText) {
    return userPickerData;
  }

  return userPickerData
    .map((user: UserData) => ({
      ...user,
      type: user.type || 'user',
    }))
    .filter((user: UserData) => {
      const searchTextInLowerCase = searchText.toLowerCase();
      const propertyToMatch: KeysOfType<UserData, string | undefined>[] = [
        'id',
        'name',
        'publicName',
      ];

      return propertyToMatch.some(
        (property: KeysOfType<UserData, string | undefined>) => {
          const value = property && user[property];
          return !!(
            value && value.toLowerCase().includes(searchTextInLowerCase)
          );
        },
      );
    });
};

interface DialogPlacementOption {
  label: string;
  value: State['dialogPlacement'];
}

const dialogPlacementOptions: Array<DialogPlacementOption> = [
  { label: 'bottom-end', value: 'bottom-end' },
  { label: 'bottom', value: 'bottom' },
  { label: 'bottom-start', value: 'bottom-start' },
  { label: 'top-start', value: 'top-start' },
  { label: 'top', value: 'top' },
  { label: 'top-end', value: 'top-end' },
  { label: 'right-start', value: 'right-start' },
  { label: 'right', value: 'right' },
  { label: 'right-end', value: 'right-end' },
  { label: 'left-start', value: 'left-start' },
  { label: 'left', value: 'left' },
  { label: 'left-end', value: 'left-end' },
];

interface ModeOption {
  label: string;
  value: ConfigResponseMode;
}

const modeOptions: Array<ModeOption> = [
  { label: 'Existing users only', value: 'EXISTING_USERS_ONLY' },
  { label: 'Invite needs approval', value: 'INVITE_NEEDS_APPROVAL' },
  { label: 'Only domain based invite', value: 'ONLY_DOMAIN_BASED_INVITE' },
  { label: 'Domain based invite', value: 'DOMAIN_BASED_INVITE' },
  { label: 'Anyone', value: 'ANYONE' },
];

interface TriggerButtonAppearanceOption {
  label: string;
  value: State['triggerButtonAppearance'];
}

const triggerButtonAppearanceOptions: Array<TriggerButtonAppearanceOption> = [
  { label: 'default', value: 'default' },
  { label: 'danger', value: 'danger' },
  { label: 'link', value: 'link' },
  { label: 'primary', value: 'primary' },
  { label: 'subtle', value: 'subtle' },
  { label: 'subtle-link', value: 'subtle-link' },
  { label: 'warning', value: 'warning' },
];

interface TriggerButtonStyleOption {
  label: string;
  value: State['triggerButtonStyle'];
}

const triggerButtonStyleOptions: Array<TriggerButtonStyleOption> = [
  { label: 'icon-only', value: 'icon-only' },
  { label: 'icon-with-text', value: 'icon-with-text' },
  { label: 'text-only', value: 'text-only' },
];

interface TriggerPositionOption {
  label: string;
  value: State['triggerButtonTooltipPosition'];
}

const triggerButtonTooltipPositionOptions: Array<TriggerPositionOption> = [
  { label: 'top', value: 'top' },
  { label: 'left', value: 'left' },
  { label: 'bottom', value: 'bottom' },
  { label: 'right', value: 'right' },
  { label: 'mouse', value: 'mouse' },
];

type ExampleState = {
  customButton: boolean;
  customTitle: boolean;
  customTooltipText: boolean;
  escapeOnKeyPress: boolean;
  restrictionMessage: boolean;
  useUrlShortener: boolean;
  product: ProductName;
};

type State = ConfigResponse & {
  dialogPlacement: DialogPlacement;
  triggerButtonAppearance: ButtonAppearances;
  triggerButtonStyle: ShareButtonStyle;
  triggerButtonTooltipPosition: TooltipPosition;
} & ExampleState;

const renderCustomTriggerButton: RenderCustomTriggerButton = ({ onClick }) => (
  <button onClick={onClick}>Custom Button</button>
);

class MockUrlShortenerClient implements UrlShortenerClient {
  count = 0;

  public isSupportedProduct(): boolean {
    return true;
  }

  public shorten(): Promise<ShortenResponse> {
    return new Promise<ShortenResponse>(resolve => {
      this.count++;
      // eslint-disable-next-line @wordpress/react-no-unsafe-timeout
      setTimeout(() => {
        resolve({
          shortUrl: `https://foo.atlassian.net/short#${this.count}`,
        });
      }, 350);
    });
  }
}

export default class Example extends React.Component<{}, State> {
  state: State = {
    allowComment: true,
    allowedDomains: ['atlassian.com'],
    customButton: false,
    customTitle: false,
    customTooltipText: false,
    restrictionMessage: false,
    useUrlShortener: false,
    dialogPlacement: dialogPlacementOptions[2].value,
    escapeOnKeyPress: true,
    mode: modeOptions[0].value,
    triggerButtonAppearance: triggerButtonAppearanceOptions[0].value,
    triggerButtonStyle: triggerButtonStyleOptions[0].value,
    triggerButtonTooltipPosition: triggerButtonTooltipPositionOptions[0].value,
    product: 'confluence',
  };

  key: number = 0;

  getConfig = (product: string, cloudId: string): Promise<ConfigResponse> =>
    new Promise(resolve => {
      // eslint-disable-next-line @wordpress/react-no-unsafe-timeout
      setTimeout(() => {
        resolve(this.state);
      }, 1000);
    });

  share = (
    _content: Content,
    _users: User[],
    _metaData: MetaData,
    _comment?: Comment,
  ) => {
    console.info('Share', {
      _content,
      _users,
      _metaData,
      _comment,
    });

    return new Promise<ShareResponse>(resolve => {
      // eslint-disable-next-line @wordpress/react-no-unsafe-timeout
      setTimeout(
        () =>
          resolve({
            shareRequestId: 'c41e33e5-e622-4b38-80e9-a623c6e54cdd',
          }),
        2000,
      );
    });
  };

  shareClient: ShareClient = {
    getConfig: this.getConfig,
    share: this.share,
  };

  urlShortenerClient: UrlShortenerClient = new MockUrlShortenerClient();

  render() {
    const {
      allowComment,
      allowedDomains,
      customButton,
      customTitle,
      customTooltipText,
      dialogPlacement,
      escapeOnKeyPress,
      mode,
      triggerButtonAppearance,
      triggerButtonStyle,
      triggerButtonTooltipPosition,
      product,
      restrictionMessage,
      useUrlShortener,
    } = this.state;

    this.key++;
    return (
      <IntlProvider locale="en">
        <App>
          {showFlags => (
            <>
              <h4>Share Component</h4>
              <WrapperWithMarginTop>
                <ShareDialogContainer
                  key={`key-${this.key}`}
                  shareClient={this.shareClient}
                  urlShortenerClient={this.urlShortenerClient}
                  cloudId="12345-12345-12345-12345"
                  dialogPlacement={dialogPlacement}
                  loadUserOptions={loadUserOptions}
                  originTracingFactory={originTracingFactory}
                  productId="confluence"
                  renderCustomTriggerButton={
                    customButton ? renderCustomTriggerButton : undefined
                  }
                  shareAri="ari"
                  shareContentType="issue"
                  shareFormTitle={customTitle ? 'Custom Title' : undefined}
                  shareTitle="My Share"
                  shouldCloseOnEscapePress={escapeOnKeyPress}
                  showFlags={showFlags}
                  triggerButtonAppearance={triggerButtonAppearance}
                  triggerButtonStyle={triggerButtonStyle}
                  triggerButtonTooltipText={
                    customTooltipText ? 'Custom Tooltip Text' : undefined
                  }
                  triggerButtonTooltipPosition={triggerButtonTooltipPosition}
                  bottomMessage={
                    restrictionMessage ? <RestrictionMessage /> : null
                  }
                  useUrlShortener={useUrlShortener}
                  product={product}
                />
              </WrapperWithMarginTop>
              <h4>Options</h4>
              <div>
                <WrapperWithMarginTop>
                  Allow comments
                  <Toggle
                    isChecked={allowComment}
                    onChange={() =>
                      this.setState({ allowComment: !allowComment })
                    }
                  />
                </WrapperWithMarginTop>
                <WrapperWithMarginTop>
                  Allowed domains: {allowedDomains && allowedDomains.join(', ')}
                </WrapperWithMarginTop>
                <WrapperWithMarginTop>
                  Close Share Dialog on escape key press
                  <Toggle
                    isChecked={escapeOnKeyPress}
                    onChange={() =>
                      this.setState({ escapeOnKeyPress: !escapeOnKeyPress })
                    }
                  />
                </WrapperWithMarginTop>
                <WrapperWithMarginTop>
                  Custom Share Dialog Trigger Button
                  <Toggle
                    isChecked={customButton}
                    onChange={() =>
                      this.setState({ customButton: !customButton })
                    }
                  />
                </WrapperWithMarginTop>
                <WrapperWithMarginTop>
                  Custom Share Dialog Title
                  <Toggle
                    isChecked={customTitle}
                    onChange={() =>
                      this.setState({ customTitle: !customTitle })
                    }
                  />
                </WrapperWithMarginTop>
                <WrapperWithMarginTop>
                  Custom Trigger Button Tooltip Text
                  <Toggle
                    isChecked={customTooltipText}
                    onChange={() =>
                      this.setState({ customTooltipText: !customTooltipText })
                    }
                  />
                </WrapperWithMarginTop>
                <WrapperWithMarginTop>
                  Show Restriction Message
                  <Toggle
                    isChecked={restrictionMessage}
                    onChange={() =>
                      this.setState({ restrictionMessage: !restrictionMessage })
                    }
                  />
                </WrapperWithMarginTop>
                <WrapperWithMarginTop>
                  Use an URL shortener
                  <Toggle
                    isChecked={useUrlShortener}
                    onChange={() =>
                      this.setState({ useUrlShortener: !useUrlShortener })
                    }
                  />
                </WrapperWithMarginTop>
                <WrapperWithMarginTop>
                  Dialog Placement
                  <Select
                    value={dialogPlacementOptions.find(
                      option => option.value === dialogPlacement,
                    )}
                    options={dialogPlacementOptions}
                    onChange={(option: any) =>
                      this.setState({ dialogPlacement: option.value })
                    }
                  />
                </WrapperWithMarginTop>
                <WrapperWithMarginTop>
                  Share Configs
                  <Select
                    value={modeOptions.find(option => option.value === mode)}
                    options={modeOptions}
                    onChange={(mode: any) =>
                      this.setState({ mode: mode.value })
                    }
                  />
                </WrapperWithMarginTop>
                <WrapperWithMarginTop>
                  Trigger Button Style
                  <Select<TriggerButtonStyleOption>
                    value={{
                      label: triggerButtonStyle,
                      value: triggerButtonStyle,
                    }}
                    options={triggerButtonStyleOptions}
                    onChange={(option: any) =>
                      this.setState({ triggerButtonStyle: option.value })
                    }
                  />
                </WrapperWithMarginTop>
                <WrapperWithMarginTop>
                  Trigger Button Appearance
                  <Select<TriggerButtonAppearanceOption>
                    value={{
                      label: triggerButtonAppearance,
                      value: triggerButtonAppearance,
                    }}
                    options={triggerButtonAppearanceOptions}
                    onChange={(option: any) =>
                      this.setState({ triggerButtonAppearance: option.value })
                    }
                  />
                </WrapperWithMarginTop>
                <WrapperWithMarginTop>
                  Trigger Button Tooltip Position
                  <Select<TriggerPositionOption>
                    value={{
                      label: triggerButtonTooltipPosition,
                      value: triggerButtonTooltipPosition,
                    }}
                    options={triggerButtonTooltipPositionOptions}
                    onChange={(option: any) =>
                      this.setState({
                        triggerButtonTooltipPosition: option.value,
                      })
                    }
                  />
                </WrapperWithMarginTop>
                <WrapperWithMarginTop>
                  Product
                  <Select
                    value={{
                      label: product,
                      value: product,
                    }}
                    options={[
                      { label: 'confluence', value: 'confluence' },
                      { label: 'jira', value: 'jira' },
                    ]}
                    onChange={(option: any) =>
                      this.setState({
                        product: option.value,
                      })
                    }
                  />
                </WrapperWithMarginTop>
              </div>
            </>
          )}
        </App>
      </IntlProvider>
    );
  }
}
