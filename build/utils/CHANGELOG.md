# @atlaskit/build-utils

## 2.6.0

### Minor Changes

- [minor][ccbd1b390b](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/ccbd1b390b):

  - Update build tooling to:
    - Only build typescript packages with a `build/tsconfig.json` dir rather than any package with `tsconfig.json` in the root
    - Remove concept of cli packages with a `build/cli/tsconfig.json` and update them to use the standard build
    - Separate the typecheck and typescript build properties in `getPackageInfo` to allow typechecking our build packages without attempting to build them

## 2.5.0

### Minor Changes

- [minor][6bce2c0290](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/6bce2c0290):

  Fix the circular dependencies between build releases and build utils by moving flattenReleases and parseChangesetCommit to build-utils.

## 2.4.0

### Minor Changes

- [minor][a41507a34d](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/a41507a34d):

  Add createSpyObject function to build-utils/logging
  Add bitbucket utils under build-utils/bitbucket

## 2.3.0

### Minor Changes

- [minor][2e18ff850d](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/2e18ff850d):

  Add runCommands module that runs commands via concurrently.

## 2.2.7

### Patch Changes

- [patch][a2d0043716](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/a2d0043716):

  Updated version of analytics-next to fix potential incompatibilities with TS 3.6

## 2.2.6

### Patch Changes

- [patch][ae47159713](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/ae47159713):

  Remove unused code inside utils/git.js

## 2.2.5

### Patch Changes

- [patch][097b696613](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/097b696613):

  Components now depend on TS 3.6 internally, in order to fix an issue with TS resolving non-relative imports as relative imports

## 2.2.4

### Patch Changes

- [patch][ecca4d1dbb](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/ecca4d1dbb):

  Upgraded Typescript to 3.3.x

## 2.2.3

### Patch Changes

- [patch][bbff8a7d87](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/bbff8a7d87):

  Fixes bug, missing version.json file

## 2.2.2

### Patch Changes

- [patch][18dfac7332](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/18dfac7332):

  In this PR, we are:

  - Re-introducing dist build folders
  - Adding back cjs
  - Replacing es5 by cjs and es2015 by esm
  - Creating folders at the root for entry-points
  - Removing the generation of the entry-points at the root
    Please see this [ticket](https://product-fabric.atlassian.net/browse/BUILDTOOLS-118) or this [page](https://hello.atlassian.net/wiki/spaces/FED/pages/452325500/Finishing+Atlaskit+multiple+entry+points) for further details

## 2.2.1

### Patch Changes

- [patch][6c713b8420](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/6c713b8420):

  Upgrade bitbucket-build-status >= 1.1.0 that has the upgrade to lodash >=4.17.11

## 2.2.0

- [minor][cfb830c23b](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/cfb830c23b):

  - getExamplesFor will look for an exact match when passed a scoped package name

## 2.1.0

- [minor][fd6a020](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/fd6a020):

  - Add new git command: getChangedChangesetFilesSinceMaster

## 2.0.3

- [patch][536456a](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/536456a):

  - Fix getCommitThatAddsFile function to not have quotes, use entire first line

## 2.0.2

- Updated dependencies [44ec8bf"
  d](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/44ec8bf"
  d):
  - @atlaskit/build-releases@3.0.0

## 2.0.0

- [major] Safety bump, some refactoring of utils, but we don't want to break consumers [ecada97](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/ecada97)

## 1.12.1

- [patch] Fixes git tagging issue [8af28a3](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/8af28a3)

## 1.12.0

- [minor] Fixed minor bug in utils/packages added ref to wrappedcomponent of withRenderTarget HoC for better testability [58be62a](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/58be62a)
