import { AVATAR_SIZES, BORDER_WIDTH } from '@atlaskit/avatar';
import { colors } from '@atlaskit/theme';
import memoizeOne from 'memoize-one';
import { getAvatarSize } from './utils';

export const BORDER_PADDING = 6;
export const PLACEHOLDER_PADDING = 8;
export const INDICATOR_WIDTH = 39;

export const getStyles = memoizeOne((width: string | number) => ({
  menu: (css: any, state: any) => ({
    ...css,
    width,
    minWidth: state.selectProps.menuMinWidth,
  }),
  control: (css: any, state: any) => {
    const isCompact = state.selectProps.appearance === 'compact';

    return {
      ...css,
      width,
      borderColor: state.isFocused
        ? css.borderColor
        : state.selectProps.subtle
        ? 'transparent'
        : colors.N40,
      backgroundColor: state.isFocused
        ? css['backgroundColor']
        : state.selectProps.subtle
        ? 'transparent'
        : colors.N10,
      '&:hover .fabric-user-picker__clear-indicator': { opacity: 1 },
      ':hover': {
        ...css[':hover'],
        borderColor: state.isFocused
          ? css[':hover']
            ? css[':hover'].borderColor
            : colors.B100
          : state.selectProps.subtle
          ? state.selectProps.hoveringClearIndicator
            ? colors.R50
            : colors.N30
          : colors.N40,
        backgroundColor:
          state.selectProps.subtle && state.selectProps.hoveringClearIndicator
            ? colors.R50
            : state.isFocused
            ? css[':hover']
              ? css[':hover'].backgroundColor
              : colors.N0
            : state.isDisabled
            ? colors.N10
            : colors.N30,
      },
      padding: 0,
      minHeight: isCompact ? 32 : 44,
      /* IE 11 needs to set height explicitly to be vertical align when being in not compact mode */
      height: isCompact ? '100%' : 44,
      alignItems: 'stretch',
      maxWidth: '100%',
    };
  },
  clearIndicator: ({
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    ...css
  }: any) => ({
    ...css,
    opacity: 0,
    transition: css.transition + ', opacity 150ms',
    paddingTop: 0,
    padding: 0,
    ':hover': {
      color: colors.R400,
    },
  }),
  indicatorsContainer: (css: any) => ({
    ...css,
    paddingRight: 4,
  }),
  valueContainer: (
    { paddingTop, paddingBottom, position, ...css }: any,
    state: any,
  ) => ({
    ...css,
    flexGrow: 1,
    padding: 0,
    display: 'flex',
    flexDirection: 'row',
    maxHeight: 100,
    overflowX: 'hidden',
    overflowY: 'auto',
    flexWrap: state.selectProps.isMulti ? 'wrap' : 'nowrap',
    scrollbarWidth: 'none',
    '::-webkit-scrollbar': {
      width: 0,
      background: 'transparent',
    },
  }),
  multiValue: (css: any) => ({
    ...css,
    borderRadius: 24,
  }),
  multiValueRemove: (css: any) => ({
    ...css,
    backgroundColor: 'transparent',
    '&:hover': { backgroundColor: 'transparent' },
  }),
  placeholder: (css: any, state: any) => {
    const avatarSize = getAvatarSize(state.selectProps.appearance);

    // fix styling in IE 11: when the position is absolute and `left` prop is not defined,
    // IE and other browsers auto calculate value of "left" prop differently,
    // so we want to explicitly set value for the `left` property
    if (css.position === 'absolute' && !css.left) {
      css.left = `${BORDER_PADDING}px`;
    }

    return {
      ...css,
      paddingLeft: !state.selectProps.isMulti
        ? BORDER_PADDING +
          PLACEHOLDER_PADDING +
          2 * BORDER_WIDTH[avatarSize] +
          AVATAR_SIZES[avatarSize]
        : PLACEHOLDER_PADDING,
      paddingTop: 2,
      paddingRight: 2,
      display: 'block',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '100%',
      margin: 0,
    };
  },
  option: (css: any) => ({
    ...css,
    overflow: 'hidden',
  }),
  input: ({ margin, ...css }: any) => ({
    ...css,
    display: 'flex',
    alignSelf: 'center',
    paddingBottom: 1,
    paddingLeft: PLACEHOLDER_PADDING,
    '& input::placeholder': {
      /* Chrome, Firefox, Opera, Safari 10.1+ */
      color: colors.N100,
      opacity: 1 /* Firefox */,
    },
    '& input:-ms-input-placeholder': {
      /* Internet Explorer 10-11 */
      color: colors.N100,
    },
  }),
}));

export const getPopupStyles = memoizeOne(
  (width: string | number, flip?: boolean) => ({
    ...getStyles(width),
    container: (css: any) => ({
      ...css,
      display: flip ? 'flex' : 'block',
      flexDirection: 'column-reverse',
    }),
    // there is not any avatar on the left of the placeholder
    placeholder: (css: any) => ({
      ...css,
      paddingLeft: PLACEHOLDER_PADDING,
      paddingTop: 2,
      paddingRight: INDICATOR_WIDTH,
      display: 'block',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '100%',
      margin: 0,
    }),
  }),
);
