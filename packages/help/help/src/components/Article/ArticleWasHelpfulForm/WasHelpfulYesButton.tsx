import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import {
  CreateUIAnalyticsEvent,
  UIAnalyticsEvent,
} from '@atlaskit/analytics-next';

import Button from '@atlaskit/button';

import {
  name as packageName,
  version as packageVersion,
} from '../../../version.json';
import { withAnalyticsEvents, withAnalyticsContext } from '../../../analytics';
import { messages } from '../../../messages';
import { Analytics } from '../../../model/Analytics';

import { withHelp, HelpContextInterface } from '../../HelpContext';

export interface Props {
  onClick?: () => void;
  isSelected?: boolean;
  createAnalyticsEvent?: CreateUIAnalyticsEvent;
}

const ArticleWasHelpfulYesButton = (
  props: Props & HelpContextInterface & Analytics & InjectedIntlProps,
) => {
  const {
    help: { onWasHelpfulYesButtonClick },
    intl: { formatMessage },
    createAnalyticsEvent,
    isSelected,
    onClick,
  } = props;

  const handleButtonClick = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
  ) => {
    if (onClick) {
      onClick();
    }

    if (onWasHelpfulYesButtonClick) {
      const analyticsEvent: UIAnalyticsEvent = createAnalyticsEvent({
        action: 'clicked',
      });
      onWasHelpfulYesButtonClick(event, analyticsEvent);
    }
  };

  return (
    <Button onClick={handleButtonClick} isSelected={isSelected}>
      {formatMessage(messages.help_panel_article_rating_option_yes)}
    </Button>
  );
};

export default withAnalyticsContext({
  componentName: 'ArticleWasHelpfulYesButton',
  packageName,
  packageVersion,
})(withAnalyticsEvents()(withHelp(injectIntl(ArticleWasHelpfulYesButton))));
