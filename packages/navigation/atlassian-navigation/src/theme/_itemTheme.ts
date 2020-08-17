// TEMPORARY ONLY
// copied from @atlaskit/droplist/src/theme/item-theme.js
// temporary fix until we have a menu item component

import { themed } from '@atlaskit/theme/components';
import { gridSize } from '@atlaskit/theme/constants';
import * as colors from '@atlaskit/theme/colors';
import { multiply } from '@atlaskit/theme/math';

// TEMPORARY
// copied from @atlaskit/item/src/util/theme.js
// https://ecosystem.atlassian.net/browse/DS-6794
const itemThemeNamespace = '@atlaskit-shared-theme/item';

const dropdownPadding = {
  bottom: gridSize,
  left: multiply(gridSize, 1.5),
  right: multiply(gridSize, 1.5),
  top: gridSize,
};

export const _itemTheme: Object = {
  [itemThemeNamespace]: {
    padding: {
      default: dropdownPadding,
      compact: dropdownPadding,
    },
    borderRadius: () => 0,
    default: {
      background: themed({ light: colors.N0, dark: colors.DN50 }),
      text: themed({ light: colors.N800, dark: colors.DN600 }),
      secondaryText: themed({ light: colors.N200, dark: colors.DN300 }),
    },
    hover: {
      background: themed({ light: colors.N20, dark: colors.DN70 }),
      text: themed({ light: colors.N800, dark: colors.DN600 }),
      secondaryText: themed({ light: colors.N200, dark: colors.DN300 }),
    },
    active: {
      background: themed({ light: colors.B75, dark: colors.B75 }),
      text: themed({ light: colors.N800, dark: colors.B400 }),
      secondaryText: themed({ light: colors.N200, dark: colors.DN300 }),
    },
    selected: {
      background: 'transparent',
      text: themed({ light: colors.N800, dark: colors.DN600 }),
      secondaryText: themed({ light: colors.N200, dark: colors.DN300 }),
    },
    disabled: {
      background: 'transparent',
      text: themed({ light: colors.N70, dark: colors.DN80 }),
      secondaryText: themed({ light: colors.N50, dark: colors.DN70 }),
    },
    focus: {
      outline: themed({ light: colors.B100, dark: colors.B75 }),
    },
  },
};
