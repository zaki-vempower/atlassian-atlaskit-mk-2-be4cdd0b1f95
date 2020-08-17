/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import Button from '@atlaskit/button';
import {
  BitbucketIcon,
  ConfluenceIcon,
  JiraServiceDeskIcon,
  JiraSoftwareIcon,
  OpsGenieIcon,
  StatuspageIcon,
} from '@atlaskit/logo';
import { FadeIn, ExitingPersistence, StaggeredEntrance } from '../src';
import { Block, RetryContainer } from '../examples-utils';

const Card = ({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: React.ReactNode;
}) => (
  <FadeIn>
    {props => (
      <li {...props} css={{ display: 'block', padding: 0, margin: '8px' }}>
        <Block
          css={{
            width: '100%',
            height: '48px',
            borderRadius: '3px',
          }}
        >
          <div
            css={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '8px',
            }}
          >
            {icon}
            <h3
              css={{
                margin: 0,
                fontWeight: 300,
                marginLeft: '8px',
              }}
            >
              {text}
            </h3>
          </div>
        </Block>
      </li>
    )}
  </FadeIn>
);

export default () => {
  const [count, setItems] = useState(6);

  return (
    <RetryContainer>
      <div css={{ textAlign: 'center', '> *': { marginRight: '4px' } }}>
        <Button onClick={() => setItems(list => list - 1)}>Remove</Button>
        <Button onClick={() => setItems(6)}>Reset</Button>

        <ul
          css={{
            maxWidth: '474px',
            padding: 0,
            margin: '16px auto !important',
            div: { margin: '0' },
          }}
        >
          <StaggeredEntrance>
            <ExitingPersistence appear>
              {count > 0 && (
                <Card icon={<BitbucketIcon size="small" />} text="Bitbucket" />
              )}
              {count > 2 && (
                <Card
                  icon={<ConfluenceIcon size="small" />}
                  text="Confluence"
                />
              )}
              {count > 1 && (
                <Card
                  icon={<JiraServiceDeskIcon size="small" />}
                  text="Jira Service Desk"
                />
              )}
              {count > 4 && (
                <Card
                  icon={<JiraSoftwareIcon size="small" />}
                  text="Jira Software"
                />
              )}
              {count > 5 && (
                <Card icon={<OpsGenieIcon size="small" />} text="Ops Genie" />
              )}
              {count > 3 && (
                <Card
                  icon={<StatuspageIcon size="small" />}
                  text="Statuspage"
                />
              )}
            </ExitingPersistence>
          </StaggeredEntrance>
        </ul>
      </div>
    </RetryContainer>
  );
};
