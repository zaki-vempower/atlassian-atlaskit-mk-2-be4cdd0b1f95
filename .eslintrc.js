const path = require('path');
const tsRecommendedRules = require('@typescript-eslint/eslint-plugin/dist/configs/recommended')
  .rules;
const prettierTsRules = require('eslint-config-prettier/@typescript-eslint')
  .rules;

const resolverPath = path.resolve(
  `${__dirname}/build/resolvers/eslint-resolver.js`,
);

module.exports = {
  extends: [
    'airbnb',
    'prettier',
    'prettier/react',
    'plugin:compat/recommended',
  ],
  settings: {
    'import/extensions': ['.js', '.ts', '.tsx'],
    // Required to resolve atlaskit deps to src and remove webpack loader prefixes
    'import/resolver': {
      // node needs to be declared first. see https://github.com/benmosher/eslint-plugin-import/issues/1396
      node: {},
      [resolverPath]: {
        debug: false,
      },
    },
    // Required so that the correct parser is used when resolving .js files from .ts
    // E.g. a TS package that imports from @atlaskit/docs (js) in an example
    'import/parsers': {
      'babel-eslint': ['.js'],
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    // List of polyfills for `eslint-plugin-compat` check
    // To know how to add in case you have a new one to add, please check
    // https://github.com/amilajack/eslint-plugin-compat/wiki/Adding-polyfills-(v2)
    polyfills: [
      // Shared polyfills across different packages
      'fetch',
      'Object.entries',
      'URL',
      'URLSearchParams',
      'AbortController',
      'Headers',
      'TouchEvent',
      'history.scrollRestoration',
      'Reflect',
      'Object.values',
      'window.scrollY',
      'Response',
      'Symbol.toStringTag',
      'Symbol.iterator',
      'Request',
      'Proxy',
      'String.raw',
      'PerformanceObserver',
      'IntersectionObserver',
      // @atlaskit/polyfills items
      'Object.assign',
      'Array.prototype.includes',
      'Array.prototype.find',
      'String.prototype.includes',
      // List based on polyfill.io polyfill added in website examples
      'Array.from',
      'Array.prototype.fill',
      'Array.prototype.find',
      'Array.prototype.findIndex',
      'Array.prototype.keys',
      'Array.prototype.values',
      'Map',
      'Math.fround',
      'Math.min',
      'Math.max',
      'Math.cos',
      'Math.floor',
      'Math.pow',
      'Math.random',
      'Math.ceil',
      'Math.floor',
      'Math.abs',
      'Math.round',
      'Math.pow',
      'Math.PI',
      'Number',
      'Number.isInteger',
      'Number.isNaN',
      'Number.parseFloat',
      'Number.parseInt',
      'Set',
      'String.prototype.endsWith',
      'String.prototype.repeat',
      'String.prototype.startsWith',
      'Symbol.iterator',
      'Symbol.toStringTag',
      'WeakMap',
      'WeakSet',
      'Promise',
    ],
  },
  parser: 'babel-eslint',
  plugins: ['flowtype', 'jest', 'prettier', 'react-hooks', '@wordpress'],
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/docs/**/*.js',
          '**/__tests__/**/*.js',
          '**/examples/**/*.js',
          './projector.js',
          // Any build dirs
          '**/build/**/*.js',
        ],
      },
    ],
    'import/no-unresolved': [
      'error',
      {
        ignore: ['@atlassian', '@atlassiansox'],
      },
    ],
    'import/prefer-default-export': 'off',
    'import/extensions': [
      'error',
      'never',
      {
        json: 'always',
      },
    ],

    // TODO: Might be worth re-enabling it at some stage (or using stricter instead)
    'import/no-cycle': 'off',

    'max-classes-per-file': 'off', // ~2159

    'no-labels': 'off',
    'no-restricted-syntax': 'off',
    'no-underscore-dangle': 'off',
    'no-use-before-define': 'off',

    'arrow-body-style': 'off',

    'spaced-comment': 'off',

    'no-async-promise-executor': 'off', // ~11
    'no-await-in-loop': 'off',

    'no-mixed-operators': 'off',
    'no-plusplus': 'off',

    'prefer-object-spread': 'off', // ~20

    '@wordpress/react-no-unsafe-timeout': 'error',

    'react/button-has-type': 'off', // ~111
    'react/sort-comp': 'off',
    'react/jsx-curly-brace-presence': 'off', // ~91
    'react/jsx-curly-newline': 'off', // ~104
    'react/jsx-filename-extension': 'off',
    'react/jsx-fragments': 'off', // ~128
    'react/jsx-props-no-spreading': 'off', // ~904
    'react/require-default-props': 'off',
    // TODO: https://ecosystem.atlassian.net/browse/AK-6060
    // enable rules after fixing linting issue after upgrade
    'react/destructuring-assignment': 'off',
    'react/default-props-match-prop-types': 'off',
    'react/no-unescaped-entities': 'off',
    'react/no-unused-state': 'off',
    'react/no-access-state-in-setstate': 'off',
    'react/no-this-in-sfc': 'off', // ~3
    'react/prefer-stateless-function': 'off',
    'react/require-render-return': 'off', // ~2
    'react/static-property-placement': 'off', // ~395
    'react/state-in-constructor': 'off', // ~591
    'jsx-a11y/control-has-associated-label': 'off', // ~13
    'jsx-a11y/label-has-associated-control': 'off',
    'jsx-a11y/mouse-events-have-key-events': 'off',

    // Remove me after removing the usage of a legacy React lifecycle methods
    // Rule was extended based on the AirBnB rule from:
    // https://github.com/airbnb/javascript/blob/282ef9ea9051dce725f382ac83cb5c3f2d4da0c2/packages/eslint-config-airbnb-base/rules/style.js#L24
    camelcase: [
      'error',
      {
        properties: 'never',
        ignoreDestructuring: false,
        allow: [
          'UNSAFE_componentWillMount',
          'UNSAFE_componentWillReceiveProps',
          'UNSAFE_componentWillUpdate',
        ],
      },
    ],

    'react/no-multi-comp': ['off', { ignoreStateless: true }], // ~36 / ~469
    'react/forbid-prop-types': [
      'error',
      {
        forbid: ['any', 'array'],
        checkContextTypes: true,
        checkChildContextTypes: true,
      },
    ],
    'react/prop-types': ['error', { ignore: ['children'] }],

    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',

    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'no-console': 'error',
    'no-restricted-globals': ['error', 'event', 'fdescribe'],

    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/valid-expect': 'error',
  },
  env: {
    browser: true,
  },
  overrides: [
    {
      files: ['**/*.js'],
      rules: {
        'flowtype/require-valid-file-annotation': [
          2,
          'always',
          { annotationStyle: 'line' },
        ],
        'flowtype/define-flow-type': 1,
      },
    },
    {
      files: ['**/*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      plugins: ['@typescript-eslint'],
      rules: {
        ...tsRecommendedRules,
        ...prettierTsRules,
        '@typescript-eslint/array-type': 'off',
        '@typescript-eslint/explicit-member-accessibility': 'off',
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/no-empty-function': 'off', // ~108
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-parameter-properties': 'off',
        '@typescript-eslint/no-triple-slash-reference': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/prefer-interface': 'off',

        'no-useless-constructor': 'off',

        // TODO: Move out of override when js files no longer violate this
        'no-restricted-imports': [
          'error',
          {
            paths: ['rxjs', 'rxjs/operators', 'rxjs/Rx', 'date-fns'],
          },
        ],

        // TODO: Set to `error` when https://github.com/evcohen/eslint-plugin-jsx-a11y/issues/565
        //       is fixed.
        'jsx-a11y/aria-proptypes': 'off',
        'jsx-a11y/no-noninteractive-element-interactions': 'off',

        // Typechecking should cover this and there are issues with this rule for TS
        // https://github.com/benmosher/eslint-plugin-import/issues/1282
        'import/named': 'off',

        // disabled temporarily during tslint -> eslint transition
        'import/no-named-as-default': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/ban-ts-ignore': 'off', // ~362
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/consistent-type-assertions': 'off', // ~20
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-object-literal-type-assertion': 'off',
        '@typescript-eslint/no-angle-bracket-type-assertion': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-useless-constructor': 'off',
        'array-callback-return': 'off',
        'class-methods-use-this': 'off',
        'consistent-return': 'off',
        'default-case': 'off',
        'dot-notation': 'off',
        'func-names': 'off',
        'global-require': 'off',
        'guard-for-in': 'off',
        'lines-around-directive': 'off',
        'import/export': 'off',
        'import/first': 'off',
        'import/newline-after-import': 'off',
        'import/no-commonjs': 'off',
        'import/no-duplicates': 'off',
        'import/no-dynamic-require': 'off',
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: [
              // Top level dirs that aren't src - can't have ** either side
              'packages/*/*/!(src)/**/*.{ts,tsx}',
              // __tests__ dirs inside src
              '**/__tests__/**/*.{ts,tsx}',
              // Any build dirs
              '**/build/**/*.{ts,tsx}',
            ],
          },
        ],
        'import/no-mutable-exports': 'off',
        'import/no-named-default': 'off',
        'import/no-useless-path-segments': 'off',
        'import/no-webpack-loader-syntax': 'off',
        'import/order': 'off',
        'jest/no-identical-title': 'off',
        'jest/no-focused-tests': 'off',
        'jest/valid-expect': 'off',
        'jsx-a11y/accessible-emoji': 'off',
        'jsx-a11y/alt-text': 'off',
        'jsx-a11y/anchor-is-valid': 'off',
        'jsx-a11y/click-events-have-key-events': 'off',
        'jsx-a11y/iframe-has-title': 'off',
        'jsx-a11y/no-autofocus': 'off',
        'jsx-a11y/no-noninteractive-tabindex': 'off',
        'jsx-a11y/no-static-element-interactions': 'off',
        'lines-between-class-members': 'off',
        'new-cap': 'off',
        'no-alert': 'off',
        'no-bitwise': 'off',
        'no-buffer-constructor': 'off',
        'no-case-declarations': 'off',
        'no-cond-assign': 'off',
        'no-continue': 'off',
        'no-control-regex': 'off',
        'no-dupe-class-members': 'off',
        'no-else-return': 'off',
        'no-empty': 'off',
        'no-empty-function': 'off',
        'no-empty-pattern': 'off',
        'no-extra-boolean-cast': 'off',
        'no-lonely-if': 'off',
        'no-loop-func': 'off',
        'no-irregular-whitespace': 'off',
        'no-multi-assign': 'off',
        'no-named-default': 'off',
        'no-nested-ternary': 'off',
        'no-new': 'off',
        'no-param-reassign': 'off',
        'no-prototype-builtins': 'off',
        'no-var': 'off',
        'no-void': 'off',
        'no-redclare': 'off',
        'no-restricted-properties': 'off',
        'no-return-assign': 'off',
        'no-return-await': 'off',
        'no-script-url': 'off',
        'no-self-assign': 'off',
        'no-sequences': 'off',
        'no-shadow': 'off',
        'no-sparse-arrays': 'off',
        'no-unneeded-ternary': 'off',
        'no-unused-expressions': 'off',
        'no-useless-concat': 'off',
        'no-useless-computed-key': 'off',
        'no-useless-escape': 'off',
        'no-useless-rename': 'off',
        'no-useless-return': 'off',
        'object-shorthand': 'off',
        'one-var': 'off',
        'operator-assignment': 'off',
        'prefer-const': 'off',
        'prefer-destructuring': 'off',
        'prefer-promise-reject-errors': 'off',
        'prefer-rest-params': 'off',
        'prefer-spread': 'off',
        'prefer-template': 'off',
        radix: 'off',
        'react/jsx-boolean-value': 'off',
        'react/jsx-no-bind': 'off',
        'react/jsx-no-target-blank': 'off',
        'react/no-array-index-key': 'off',
        'react/no-children-prop': 'off',
        'react/no-danger': 'off',
        'react/no-did-update-set-state': 'off', // ~12
        'react/no-will-update-set-state': 'off',
        'react/no-find-dom-node': 'off',
        'react/no-string-refs': 'off',
        'react/no-typos': 'off',
        'react/prop-types': 'off',
        'react/style-prop-object': 'off',
        strict: 'off',
        'valid-typeof': 'off',
        'vars-on-top': 'off',
        yoda: 'off',
      },
    },
    {
      files: [
        'packages/*/*/examples/**',
        'packages/**/example-helpers/**',
        'packages/**/examples-helpers/**',
        'packages/monorepo-tooling/**',
      ],
      rules: {
        'no-console': 'off',
        'max-classes-per-file': 'off',
        '@typescript-eslint/no-empty-function': 'off',
      },
    },
    {
      files: ['packages/*/*/docs/**'],
      rules: {
        'global-require': 'off',
        'import/no-webpack-loader-syntax': 'off',
      },
    },
    {
      files: [
        '**/__tests__/**',
        '**/__mocks__/**',
        '**/*.test.{js,ts,tsx}',
        '**/*-test-helpers/**',
        '**/__tests-karma__/**',
      ],
      env: {
        jest: true,
      },
      globals: {
        SYNCHRONY_URL: 'readonly',
        fail: 'readonly',
        jasmine: 'readonly',
        spyOn: 'readonly',
      },
      rules: {
        'global-require': 'off',
        'no-restricted-imports': 'off',
        'max-classes-per-file': 'off',
        '@typescript-eslint/no-empty-function': 'off',
      },
    },
    {
      files: ['**/build/**'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
