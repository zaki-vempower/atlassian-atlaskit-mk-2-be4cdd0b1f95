import React, { useState, Fragment } from 'react';
import Popup from '@atlaskit/popup';
import { ThemeProvider } from 'styled-components';
import { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';

import { Help, _itemTheme } from '../../src';

const HelpContent = () => (
  <ThemeProvider theme={_itemTheme}>
    <Fragment>
      <DropdownItemGroup title="Help">
        <DropdownItem>Atlassian Documentation</DropdownItem>
        <DropdownItem>Atlassian Community</DropdownItem>
        <DropdownItem>What's New</DropdownItem>
        <DropdownItem>Get Jira Mobile</DropdownItem>
        <DropdownItem>Keyboard shortcuts</DropdownItem>
        <DropdownItem>About Jira</DropdownItem>
      </DropdownItemGroup>
      <DropdownItemGroup title="Legal">
        <DropdownItem>Terms of use</DropdownItem>
        <DropdownItem>Privacy Policy</DropdownItem>
      </DropdownItemGroup>
    </Fragment>
  </ThemeProvider>
);

export const HelpPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  const onClick = () => {
    setIsOpen(!isOpen);
  };

  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <Popup
      placement="bottom-start"
      content={HelpContent}
      isOpen={isOpen}
      onClose={onClose}
      trigger={triggerProps => (
        <Help
          isSelected={isOpen}
          onClick={onClick}
          tooltip="Help"
          {...triggerProps}
        />
      )}
    />
  );
};
