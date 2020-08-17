// @flow
import React from 'react';
import { md, Example, Props } from '@atlaskit/docs';
import SectionMessage from '@atlaskit/section-message';

export default md`
  ${(
    <SectionMessage
      appearance="warning"
      title="Note: @atlaskit/multi-select is deprecated."
    >
      Please use @atlaskit/select instead.
    </SectionMessage>
  )}

  React component which allows selection of a single item from a dropdown list. Substitute for the native select element.

  ${(
    <Example
      packageName="@atlaskit/single-select"
      Component={require('../examples/00-basic').default}
      source={require('!!raw-loader!../examples/00-basic')}
      title="Basic"
    />
  )}

  ${(
    <Example
      packageName="@atlaskit/single-select"
      Component={require('../examples/01-stateless').default}
      source={require('!!raw-loader!../examples/01-stateless')}
      title="With Stateless Select"
    />
  )}

  ${(
    <Props
      heading="Stateful Props"
      props={require('!!extract-react-types-loader!../src/components/SingleSelect')}
    />
  )}

  ${(
    <Props
      heading="Stateless Props"
      props={require('!!extract-react-types-loader!../src/components/StatelessSelect')}
    />
  )}
`;
