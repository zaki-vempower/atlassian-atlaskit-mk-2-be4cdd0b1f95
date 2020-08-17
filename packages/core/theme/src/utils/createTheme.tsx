import React, { createContext, ComponentType, ReactNode } from 'react';

export type ThemeProp<ThemeTokens, ThemeProps> = (
  getTokens: (props: ThemeProps) => ThemeTokens,
  themeProps: ThemeProps,
) => ThemeTokens;

/*
createTheme is used to create a set of Providers and Consumers for theming components.
- Takes a default theme function; this theme function gets a set of props, and returns tokens
   based on those props. An example of this default theme function is one that produces the standard
   appearance of the component
- Returns two things - a Provider that allow for additional themes to be applied, and a Consumer
   that can get the current theme and fetch it.
*/
export function createTheme<ThemeTokens, ThemeProps>(
  defaultGetTokens: (props: ThemeProps) => ThemeTokens,
): {
  Consumer: ComponentType<
    ThemeProps & {
      children: (tokens: ThemeTokens) => ReactNode;
    }
  >;
  Provider: ComponentType<{
    children?: ReactNode;
    value?: ThemeProp<ThemeTokens, ThemeProps>;
  }>;
} {
  const emptyThemeFn: ThemeProp<ThemeTokens, ThemeProps> = (getTokens, props) =>
    getTokens(props);

  /* Internally, Theme uses React Context, with internal providers and consumers.
     The React Context passes only a function that gets props, and turns them into tokens. This
        function gets mixed as more Providers with their own themes are added. This mixed function
        is ultimately picked up by Consumers, which implement a context consumer internally to fetch
        the theme. */
  const ThemeContext = createContext(defaultGetTokens);

  // The Theme Consumer takes a function as its child - this function takes tokens, and the
  // return value is generally a set of nodes with the tokens applied appropriately.
  function Consumer(
    props: ThemeProps & { children: (tokens: ThemeTokens) => ReactNode },
  ) {
    const { children, ...themeProps } = props;
    return (
      <ThemeContext.Consumer>
        {theme => {
          const themeFn = theme || emptyThemeFn;
          // @ts-ignore See issue for more info: https://github.com/Microsoft/TypeScript/issues/10727
          // Argument of type 'Pick<ThemeProps & { children: (tokens: ThemeTokens) => ReactNode; }, Exclude<keyof ThemeProps, "children">>' is not assignable to parameter of type 'ThemeProps'.ts(2345)
          const tokens = themeFn(themeProps);
          return children(tokens);
        }}
      </ThemeContext.Consumer>
    );
  }

  /* The Theme Provider takes regular nodes as its child, but also takes a *theme function*
     - The theme function takes a set of props, as well as a function (getTokens) that can
        turn props into tokens.
     - The getTokens function isn't called immediately - instead the props are passed
        through a mix of parent theming functions
     Children of this provider will receive this mixed theme
  */
  function Provider(props: {
    children?: ReactNode;
    value?: ThemeProp<ThemeTokens, ThemeProps>;
  }) {
    return (
      <ThemeContext.Consumer>
        {themeFn => {
          const valueFn = props.value || emptyThemeFn;
          const mixedFn = (themeProps: ThemeProps) =>
            valueFn(themeFn, themeProps);
          return (
            <ThemeContext.Provider value={mixedFn}>
              {props.children}
            </ThemeContext.Provider>
          );
        }}
      </ThemeContext.Consumer>
    );
  }

  return { Consumer, Provider };
}
