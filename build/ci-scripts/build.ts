/**
 * The canonical build script for Atlaskit.
 * See CONTRIBUTING.md#building-packages or
 * run `yarn build --help` for more information.
 */
/* eslint-disable no-throw-literal */
import * as bolt from 'bolt';
import chalk from 'chalk';
import meow from 'meow';
import * as yalc from 'yalc';

import { isDefined } from '@atlaskit/build-utils/guards';
import { PackageInfo, Tool } from '@atlaskit/build-utils/types';
import {
  getPackagesInfo,
  TOOL_NAME_TO_FILTERS,
} from '@atlaskit/build-utils/tools';
import { prefixConsoleLog } from '@atlaskit/build-utils/logging';
import getGlobPackagesForTools from './get.glob.packages.for.tools';
import createEntryPointsDirectories from './create.entry.points.directories';
import copyVersion from './copy.version';
import validateDists from './validate.dists';
import runCommands, {
  Options as RunOptions,
} from '@atlaskit/build-utils/runCommands';

type DistType = 'cjs' | 'esm' | 'none';
// Its intentional to set the keys here to mandatory
// We use the Partial<T> helper fn where we want optional keys
type Options = {
  cwd: string | undefined;
  distType: DistType | undefined;
  strict: boolean | undefined;
  watch: boolean | undefined;
};
type StepArgs = Options & { pkg: PackageInfo | undefined };

function log(...msg: any[]) {
  console.log(chalk.green('Atlaskit build:'), ...msg);
}

async function getPkgGlob(
  tools: Tool[],
  pkg: PackageInfo | undefined,
  { cwd }: { cwd?: string },
): Promise<string | null> {
  if (pkg) {
    return tools.every(tool => TOOL_NAME_TO_FILTERS[tool](pkg))
      ? pkg.relativeDir
      : null;
  }
  return getGlobPackagesForTools(tools, { cwd });
}

function getDistCommands(
  commands: {
    cjs: string;
    esm: string;
  },
  distType: DistType | undefined,
): string[] {
  if (distType === 'none') {
    return [];
  } else if (!distType) {
    return Object.values(commands).filter(isDefined);
  } else {
    return [commands[distType]].filter(isDefined);
  }
}

/**
 * We pattern match watch command output to detect when a recompile has successfully finished.
 * However, since we execute two watch commands if building both types of dists, we have to ensure
 * that we only emit success when both watch commands have finished rather than only one.
 */
function generateWatchSuccessCondition(
  regex: RegExp,
  distType: DistType | undefined,
) {
  const successesRequired = distType ? 1 : 2;
  let successCount = 0;
  return (output: string) => {
    successCount += regex.test(output) ? 1 : 0;
    if (successCount === successesRequired) {
      successCount = 0;
      return true;
    }
    return false;
  };
}

/* Returns watch specific options to the runCommands module that allows us to execute steps after
 * a successful recompile.
 * The steps executed are:
 *   - Validate dists
 *   - Publish package to yalc and push to linked repos
 */
function getWatchCommandOptions(
  buildOptions: {
    cwd: string | undefined;
    distType: DistType | undefined;
    pkg: PackageInfo;
  },
  successRegex: RegExp,
  firstSuccessRegex?: RegExp,
) {
  const { cwd, distType, pkg } = buildOptions;
  const options: Pick<
    RunOptions,
    'watchSuccessCondition' | 'onWatchSuccess' | 'watchFirstSuccessCondition'
  > = {
    watchSuccessCondition: generateWatchSuccessCondition(
      successRegex,
      distType,
    ),
    onWatchSuccess: async ({ firstSuccess }) => {
      if (firstSuccess) {
        // Validate dists after initial build to verify they aren't broken
        // We don't run after every recompile since this will fail when adding
        // a new file that would be an entry point.
        await runValidateDists({
          cwd,
          distType,
          packageName: pkg.name,
        });
      }
      const restoreConsoleLog = prefixConsoleLog(chalk.blue('Yalc:'));
      // Publish package to yalc with push mode to automatically update the package in linked repos
      await yalc.publishPackage({
        workingDir: pkg.dir,
        changed: true,
        push: true,
      });
      restoreConsoleLog();
      log('Recompiled and pushed changes...');
    },
  };

  if (firstSuccessRegex) {
    options.watchFirstSuccessCondition = generateWatchSuccessCondition(
      firstSuccessRegex,
      distType,
    );
  }

  return options;
}

async function generateFlowTypeCommands({
  cwd,
  distType,
  pkg,
  watch,
}: StepArgs) {
  const pkgGlob = await getPkgGlob(['babel', 'flow'], pkg, { cwd });
  if (!pkgGlob) {
    return [];
  }
  const watchFlag = watch ? ' -w' : '';
  const commands = {
    cjs: `bolt workspaces exec --only-fs "${pkgGlob}" -- flow-copy-source -i '**/__tests__/**' src dist/cjs${watchFlag}`,
    esm: `bolt workspaces exec --only-fs "${pkgGlob}" -- flow-copy-source -i '**/__tests__/**' src dist/esm${watchFlag}`,
  };

  return getDistCommands(commands, distType);
}

async function babelCommands({ cwd, distType, pkg, watch }: StepArgs) {
  const pkgGlob = await getPkgGlob(['babel'], pkg, { cwd });
  if (!pkgGlob) {
    return [];
  }
  // Watch mode does not output anything on recompile, so we have to use verbose to signal something has happened
  // https://github.com/babel/babel/issues/7926
  const watchFlag = watch ? ' -w --verbose' : '';
  const commands = {
    cjs: `NODE_ENV=production BABEL_ENV=production:cjs bolt workspaces exec --parallel --only-fs "${pkgGlob}" -- babel src -d dist/cjs --root-mode upward${watchFlag}`,
    esm: `NODE_ENV=production BABEL_ENV=production:esm bolt workspaces exec --parallel --only-fs "${pkgGlob}" -- babel src -d dist/esm --root-mode upward${watchFlag}`,
  };

  return getDistCommands(commands, distType);
}

async function buildJSPackages({
  cwd,
  distType,
  strict,
  pkg,
  watch,
}: StepArgs) {
  let commandOptions: RunOptions = { cwd };
  if (watch) {
    commandOptions = {
      ...commandOptions,
      ...getWatchCommandOptions(
        // If watch mode is enabled, we have a package
        // TODO: Add TS 3.7 assertion here
        { cwd, distType, pkg: pkg as PackageInfo },
        /babel/,
        /Successfully compiled/,
      ),
    };
  }
  return runCommands(
    [
      ...(await babelCommands({ cwd, pkg, strict, watch, distType })),
      ...(await generateFlowTypeCommands({
        cwd,
        strict,
        pkg,
        watch,
        distType,
      })),
    ],
    commandOptions,
  );
}

async function standardTsCommands({
  cwd,
  distType,
  strict,
  pkg,
  watch,
}: StepArgs) {
  const pkgGlob = await getPkgGlob(['typescriptbuild'], pkg, { cwd });
  if (!pkgGlob) {
    return [];
  }
  // preserveWatchOutput prevents watch from clearing console output on every change
  const watchFlag = watch ? ' -w --preserveWatchOutput' : '';
  const ignoreErrors = !!(pkg && !strict);
  /* We only ignore typescript errors when building single packages only since they produce 'Cannot find module' errors when any dependency
   * is not built. This can be opted out of with the --no-ignore flag.
   *
   * We use the '--excludeFromGraph devDependencies' flag to exclude devDependencies from bolt's topological execution order over workspaces
   * where it executes dependencies before their dependents. This prevents false positive cyclic dependencies between workspaces and avoids
   * 'Cannot find module' TS errors that occur when building a dependent before all of its dependencies.
   *
   * The CJS builds use bolt's topological ordering mentioned above. We execute the ESM build in full parallel mode however because the
   * typescript compiler references dependencies via the CJS build, denoted by the types field of each package.json pointing to dist/cjs,
   * which are already built.
   */
  const commands = {
    cjs: `NODE_ENV=production bolt workspaces exec --no-bail --excludeFromGraph devDependencies --only-fs "${pkgGlob}" -- bash -c 'tsc --project ./build/tsconfig.json --outDir ./dist/cjs --module commonjs${watchFlag} && echo Success${
      ignoreErrors ? ' || true' : ''
    }'`,
    esm: `NODE_ENV=production bolt workspaces exec --parallel --no-bail --excludeFromGraph devDependencies --only-fs "${pkgGlob}" -- bash -c 'tsc --project ./build/tsconfig.json --outDir ./dist/esm --module esnext${watchFlag} && echo Success${
      ignoreErrors ? ' || true' : ''
    }'`,
  };

  return getDistCommands(commands, distType);
}

/**
 * Builds typescript packages.
 *
 * Typescript packages in a monorepo need to be built in a topological order, meaning dependencies need to be built before their dependents. Otherwise
 * any dependency types used are treated as `any`.
 * We are leveraging `bolt workspaces exec`'s default topological execution order to achieve this, however there are some existing issues with this:
 *  - The topological order factors in devDependencies when they are not required for building source -https://github.com/boltpkg/bolt/pull/244
 *  - At least one circular dependency exists between packages in the repo, which makes a pure topological sort impossible
 */
async function buildTSPackages({
  cwd,
  distType,
  strict,
  pkg,
  watch,
}: StepArgs) {
  let commandOptions: RunOptions = { cwd };
  if (watch) {
    commandOptions = {
      ...commandOptions,
      ...getWatchCommandOptions(
        // If watch mode is enabled, we have a package
        // TODO: Add TS 3.7 assertion here
        { cwd, distType, pkg: pkg as PackageInfo },
        /Watching for file changes./,
      ),
    };
  }

  return runCommands(
    await standardTsCommands({ cwd, distType, strict, pkg, watch }),
    /* When building all packages we run the ts commands sequentially  as the `types` field in package.json
     * references the main index.d.ts in the cjs directory. Resulting in cjs needing to be built before esm/cli
     * so that packages can properly utilise the types of their atlaskit dependencies.
     * When building a package individually, we no longer have this requirement as we are only building a single package.
     */
    { sequential: !pkg, ...commandOptions },
  );
}

async function buildExceptionPackages({ cwd, pkg }: StepArgs) {
  await bolt.workspacesRun({
    cwd,
    filterOpts: {
      only: pkg && pkg.name,
    },
    spawnOpts: {
      orderMode: 'parallel',
    },
    script: 'ak-postbuild',
  });
}

async function getPkgInfo(
  packageName: string,
  { cwd }: { cwd?: string } = {},
): Promise<PackageInfo> {
  const allPkgs = await getPackagesInfo(cwd, {
    only: `**/${packageName}`,
  });
  if (allPkgs.length === 0) {
    throw Error(`Cannot find package "${packageName}" in workspaces`);
  }
  if (allPkgs.length > 1) {
    throw Error(`Matched multiple packages, provide an exact package name`);
  }
  return allPkgs[0];
}

async function runValidateDists(opts: {
  cwd: string | undefined;
  distType: DistType | undefined;
  packageName: string | undefined;
}) {
  const { success, packageDistErrors } = await validateDists(opts);
  if (!success) {
    throw new Error(
      `${
        packageDistErrors.length
      } errors detected in package dists:\n * ${packageDistErrors.join('\n * ')}

      If a lot of errors have been detected, you most likely have introduced a circular dependency which has malformed the dist structure entirely. Remove the circular dependency to resolve the issue.
      Otherwise if only a few errors are reported, they may be caused by adding new entry points that haven't been included in tsconfig.entry-points.json. Run yarn build:multi-entry-point-tsconfig to resolve this.`,
    );
  }
}

function validateArgs(packageName: string | undefined, opts: Options) {
  const { distType, watch } = opts;
  if (!packageName && watch) {
    throw 'Watch mode is only supported for single package builds only.';
  }
  if (
    typeof distType === 'string' &&
    !['esm', 'cjs', 'none'].includes(distType)
  ) {
    throw 'Invalid dist type, must be one of "esm", "cjs" or "none"';
  }
  if (distType === 'none' && watch) {
    throw 'Watch mode with distType "none" does nothing.';
  }
}

export default async function main(
  packageName: string | undefined,
  opts: Partial<Options> & { indent?: number } = {},
) {
  // Ensure we have all option keys set for our internal functions
  const options: Options = {
    cwd: opts.cwd,
    distType: opts.distType,
    strict: opts.strict,
    watch: opts.watch,
  };
  const { cwd, watch } = options;
  validateArgs(packageName, options);
  if (watch) {
    // Do a full build first to ensure non-compilation build steps have built since they are not rerun
    // in watch mode. Set dist type to none so we don't unnecessarily build dists since that will happen on the
    // initial watch execution.
    log(
      'Running initial build for watch mode to cover non-compilation build steps...',
    );
    await main(packageName, { ...options, distType: 'none', watch: false });
  }

  let fullPackageName;
  let pkg;
  if (packageName) {
    pkg = await getPkgInfo(packageName, { cwd });
    fullPackageName = pkg.name;
  }

  log(`Building ${pkg ? fullPackageName : 'all packages'}...`);
  log('Creating entry point directories...');
  await createEntryPointsDirectories({ cwd, packageName: fullPackageName });
  log('Building JS packages...');
  await buildJSPackages({ pkg, ...options });
  log('Building TS packages...');
  await buildTSPackages({ pkg, ...options });
  log('Running post-build scripts for packages...');
  await buildExceptionPackages({ pkg, ...options });
  log('Copying version.json...');
  await copyVersion(fullPackageName);
  log('Validating dists...');
  await runValidateDists({
    cwd,
    distType: options.distType,
    packageName: fullPackageName,
  });

  log('Success');
}

if (require.main === module) {
  process.on('SIGINT', () => {
    // We need our own SIGINT handler since concurrently overrides the default one (and doesn't even throw)
    process.exit(2);
  });
  const cli = meow(
    `
      Usage
        $ build [packageName]

      where packageName is a long form (@atlaskit/my-pkg) or short form (my-pkg) name

      Options
        -d, --distType <cjs|esm|none> Run the build only for a specific distType, cjs or esm, or specify 'none' to not compile a dist type and only run other build steps
        -s, --strict                  Do not ignore typescript errors when building single packages. (They are always unignored for full builds)
        -w, --watch                   Run the build in watch mode. Note this only reruns the compilation step (tsc/babel) and only works with a single package

      Examples
        $ build @atlaskit/button -w
        $ build editor-core --watch --distType cjs
        $ build -d cjs
  `,
    {
      description:
        'Builds [packageName] or all packages if no package name provided',
      flags: {
        distType: {
          alias: 'd',
          type: 'string',
        },
        strict: {
          alias: 's',
          type: 'boolean',
        },
        watch: {
          alias: 'w',
          type: 'boolean',
        },
      },
    },
  );

  main(cli.input[0], {
    cwd: process.cwd(),
    ...cli.flags,
  }).catch(e => {
    console.error(e);
    process.exit(1);
  });
}
