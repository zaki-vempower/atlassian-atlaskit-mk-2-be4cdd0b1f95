export type PkgJson = {
  name: string;
  version: string;
  [allOtherFields: string]: any;
};

export type PackageInfo = {
  dir: string;
  name: string;
  config: PkgJson;
  relativeDir: string;
  isBrowserPackage: boolean;
  runTypeScriptBuild: boolean;
  runTypecheck: boolean;
  runBabel: boolean;
  runFlow: boolean;
  runESLint: boolean;
  runKarma: boolean;
  runBrowserStack: boolean;
  runStylelint: boolean;
  runWebdriver: boolean;
  runVisualRegression: boolean;
};

export type Tool =
  | 'typecheck'
  | 'typescriptbuild'
  | 'babel'
  | 'flow'
  | 'eslint'
  | 'karma'
  | 'browserstack'
  | 'stylelint'
  | 'webdriver'
  | 'vr';
