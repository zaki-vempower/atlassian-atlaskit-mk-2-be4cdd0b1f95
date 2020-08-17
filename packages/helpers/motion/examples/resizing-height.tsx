/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useState } from 'react';
import { elevation, focusRing, colors } from '@atlaskit/theme';
import Button from '@atlaskit/button';
import {
  BitbucketIcon,
  ConfluenceIcon,
  JiraSoftwareIcon,
  OpsGenieIcon,
  StatuspageIcon,
} from '@atlaskit/logo';
import { useResizingHeight, FadeIn, StaggeredEntrance } from '../src';
import { Centered } from '../examples-utils';

const logos = [
  [<BitbucketIcon size="small" />, 'Bitbucket'],
  [<ConfluenceIcon size="small" />, 'Confluence'],
  [<JiraSoftwareIcon size="small" />, 'Jira Software'],
  [<OpsGenieIcon size="small" />, 'Ops Genie'],
  [<StatuspageIcon size="small" />, 'Statuspage'],
];

const searchTerm: { [key: string]: string } = {
  s1: 'dev',
  s2: 'design',
  s3: 'software',
  s4: 'ops',
  s5: 'all',
};

export default () => {
  const [num, setNum] = useState(1);

  return (
    <div>
      <div css={{ textAlign: 'center', '> *': { margin: '2px' } }}>
        {[1, 2, 3, 4, 5].map(number => (
          <Button
            testId={`button--${number}`}
            key={number}
            isSelected={num === number}
            onClick={() => {
              setNum(number);
            }}
          >
            {number}
          </Button>
        ))}
      </div>

      <Centered>
        <div
          data-testid="menu"
          {...useResizingHeight()}
          css={css`
            ${elevation.e500()};
            border-radius: 3px;
            margin-top: 24px;
            margin-bottom: 56px;
            max-width: 500px;
            width: 100%;
            padding-bottom: 8px;
          `}
        >
          <input
            autoFocus
            type="text"
            readOnly
            value={searchTerm[`s${num}`]}
            css={css`
              ${focusRing(colors.B500, 2)};
              display: block;
              border-radius: 3px 3px 0 0;
              color: #172b4d;
              font-size: 24px;
              padding: 16px;
              border: none;
              box-sizing: border-box;
              width: 100%;
              margin-bottom: 8px;

              :hover {
                background-color: ${colors.N10};
              }
            `}
          />
          <StaggeredEntrance columns={1}>
            {Array(num)
              .fill(undefined)
              .map((_, index) => (
                <FadeIn key={index}>
                  {motion => (
                    <div
                      css={css`
                        font-size: 16px;
                        font-weight: 500;
                        padding: 16px;
                        display: flex;

                        :hover {
                          background-color: ${colors.N20};
                        }
                      `}
                      {...motion}
                    >
                      {logos[index][0]}
                      <h3
                        css={{
                          margin: 0,
                          fontWeight: 300,
                          marginLeft: '8px',
                        }}
                      >
                        {logos[index][1]}
                      </h3>
                    </div>
                  )}
                </FadeIn>
              ))}
          </StaggeredEntrance>
        </div>
      </Centered>
    </div>
  );
};
