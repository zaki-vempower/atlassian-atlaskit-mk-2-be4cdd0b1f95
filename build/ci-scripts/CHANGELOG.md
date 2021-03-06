# @atlaskit/ci-scripts

## 1.1.1

### Patch Changes

- [patch][6a22d73b24](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/6a22d73b24):

  Unignore typescript errors when building TS packages and add --strict flag to also unignore when building single packages

## 1.1.0

### Minor Changes

- [minor][ccbd1b390b](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/ccbd1b390b):

  - Update build tooling to:
    - Only build typescript packages with a `build/tsconfig.json` dir rather than any package with `tsconfig.json` in the root
    - Remove concept of cli packages with a `build/cli/tsconfig.json` and update them to use the standard build
    - Separate the typecheck and typescript build properties in `getPackageInfo` to allow typechecking our build packages without attempting to build them

### Patch Changes

- Updated dependencies [ccbd1b390b](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/ccbd1b390b):
  - @atlaskit/build-utils@2.6.0

## 1.0.7

### Patch Changes

- [patch][4156c2c34d](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/4156c2c34d):

  Update build with better watch mode that will push changes to linked repos. Also single dist type build option.

## 1.0.6

### Patch Changes

- [patch][a2d0043716](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/a2d0043716):

  Updated version of analytics-next to fix potential incompatibilities with TS 3.6

## 1.0.5

### Patch Changes

- [patch][097b696613](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/097b696613):

  Components now depend on TS 3.6 internally, in order to fix an issue with TS resolving non-relative imports as relative imports

## 1.0.4

### Patch Changes

- [patch][ecca4d1dbb](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/ecca4d1dbb):

  Upgraded Typescript to 3.3.x

## 1.0.3

### Patch Changes

- [patch][43f66019ee](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/43f66019ee):

  Updates dependency on p-wait-for

## 1.0.2

### Patch Changes

- [patch][18dfac7332](https://bitbucket.org/atlassian/atlaskit-mk-2/commits/18dfac7332):

  In this PR, we are:

  - Re-introducing dist build folders
  - Adding back cjs
  - Replacing es5 by cjs and es2015 by esm
  - Creating folders at the root for entry-points
  - Removing the generation of the entry-points at the root
    Please see this [ticket](https://product-fabric.atlassian.net/browse/BUILDTOOLS-118) or this [page](https://hello.atlassian.net/wiki/spaces/FED/pages/452325500/Finishing+Atlaskit+multiple+entry+points) for further details
