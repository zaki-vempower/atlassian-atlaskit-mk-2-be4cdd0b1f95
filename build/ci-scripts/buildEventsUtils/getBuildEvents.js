//@flow
/*
 * Utilities helper to get build data.
 */
const axios = require('axios');
const yaml = require('js-yaml');
const fs = require('fs');

// started_on and duration_in_seconds are added to the object only for the logic below they are not sent to the service.
/*::
type IStepsDataType = {
  step_uuid?: string,
  step_command?: string,
  step_name: string,
  step_status: string,
  step_duration: number,
  started_on?: string,
  duration_in_seconds?: number,
}
*/

/*:: type IBuildEventProperties = {
  build_number : string,
  build_status : string,
  build_time : number,
  build_number_steps : number,
  build_type : string,
  build_name : string,
  build_steps: Array<IStepsDataType>
}
*/

/*::
type IPipelines = {
  default: Array<Object>,
  custom: Object,
  branches: { master: Object}
}
*/

const {
  BITBUCKET_REPO_FULL_NAME,
  BITBUCKET_USER,
  BITBUCKET_PASSWORD,
} = process.env;

if (!BITBUCKET_REPO_FULL_NAME || !BITBUCKET_USER || !BITBUCKET_PASSWORD) {
  throw Error(
    '$BITBUCKET_REPO_FULL_NAME or $BITBUCKET_USER or $BITBUCKET_PASSWORD environment variables are not set',
  );
}

const axiosRequestConfig = {
  auth: {
    username: BITBUCKET_USER,
    password: BITBUCKET_PASSWORD,
  },
};

/* This function computes build time if build.duration_in_seconds returns 0, it is often applicable for 1 step build.
 * The Bitbucket computation is simple, they sum the longest step time with the shortest one.
 */
async function computeBuildTime(
  stepsData /*: Array<IStepsDataType>*/,
) /*: Promise<number> */ {
  let buildDuration;
  // We need to filter if step_duration exists and if step is not run.
  const stepDurationArray = stepsData
    .filter(step => step.step_duration && step.step_status !== 'NOT_RUN')
    .map(step => step.step_duration);
  // When a build has 1 step, we can't apply this function, we take the only available value.
  if (stepDurationArray.length === 1) {
    // eslint-disable-next-line prefer-destructuring
    buildDuration = stepDurationArray[0];
  } else {
    // The minimum step duration cannot be 0 and it is in avg 30s in AK.
    const minStepDuration =
      Math.min.apply(null, stepDurationArray) === 0
        ? 30
        : Math.min.apply(null, stepDurationArray);
    buildDuration = Math.max.apply(null, stepDurationArray) + minStepDuration;
  }
  return buildDuration;
}

/* This function returns the build duration time. */
async function getBuildTime(
  buildTime /*:? number */,
  stepsData /*: Array<IStepsDataType>*/,
) {
  const computedBuildTime = await computeBuildTime(stepsData);
  if (buildTime) {
    if (computedBuildTime > buildTime) {
      return computedBuildTime;
    }
    return buildTime;
  }
  return computedBuildTime;
}

/* This function computes step time if step.duration_in_seconds returns undefined or 0.
 * The function returns the difference between the current time and when the step started,
 * It is more likely applicable for 1 step build.
 */
async function computeStepTimes(
  stepStartTime /*: string */,
) /*: Promise<number> */ {
  const currentTime = Date.now();
  // It returns the time in ms, we want in seconds.
  return (parseInt(currentTime, 10) - Date.parse(stepStartTime)) / 1000;
}

/* This function returns the step duration time. */
async function getStepTime(
  stepObject /*: IStepsDataType */,
  stepsLength /*: number */,
) {
  let stepDuration;
  if (
    stepObject &&
    stepObject.duration_in_seconds &&
    stepObject.duration_in_seconds > 0 &&
    stepsLength > 1
  ) {
    stepDuration = stepObject.duration_in_seconds;
  } else {
    // We need to do a computation if the step.duration_in_seconds is not yet available and it is a 1 step build.
    stepDuration = stepObject.started_on
      ? computeStepTimes(stepObject.started_on)
      : 0;
  }
  return stepDuration;
}

/* This function returns the payload for the build / pipelines. */
async function getPipelinesBuildEvents(
  buildId /*: string */,
) /*: Promise<IBuildEventProperties> */ {
  let payload /*: $Shape<IBuildEventProperties> */ = {};
  const apiEndpoint = `https://api.bitbucket.org/2.0/repositories/${BITBUCKET_REPO_FULL_NAME}/pipelines/${buildId}`;
  try {
    const res = await axios.get(apiEndpoint, axiosRequestConfig);
    const build = res.data;
    const stepsData = await getStepsEvents(
      buildId,
      build.target.selector.pattern || build.target.selector.type,
    );
    // eslint-disable-next-line no-nested-ternary
    const buildStatus = process.env.BITBUCKET_EXIT_CODE
      ? process.env.BITBUCKET_EXIT_CODE === '0'
        ? 'SUCCESSFUL'
        : 'FAILED'
      : build.state.result.name;
    if (stepsData) {
      const buildTime = await getBuildTime(
        build.duration_in_seconds,
        stepsData,
      );
      payload = {
        build_number: buildId,
        build_status: buildStatus,
        build_time: buildTime,
        // build_type categorises the type of the build that runs:
        // - default
        // - master
        // - custom
        // Most of the time, build.target.selector.pattern === build.target.ref_name.
        // It depends on what is available for the particular build.
        build_type:
          build.target.selector.pattern ||
          build.target.selector.type ||
          'default',
        // build_name refers to the branch name that runs this build.
        // In case, the build_name is undefined, we will refer it as its type.
        build_name:
          build.target.ref_name ||
          build.target.selector.pattern ||
          build.target.selector.type,
        build_number_steps: stepsData.length,
        build_steps: stepsData,
      };
    }
  } catch (err) {
    console.error(err.toString());
    process.exit(1);
  }
  return payload;
}

/* This function returns the payload for the build steps.*/
// eslint-disable-next-line consistent-return
async function getStepsEvents(
  buildId /*: string*/,
  buildType /*:? string */,
) /* IStepsDataType */ {
  const url = `https://api.bitbucket.org/2.0/repositories/${BITBUCKET_REPO_FULL_NAME}/pipelines/${buildId}/steps/`;
  try {
    const resp = await axios.get(url, axiosRequestConfig);
    return Promise.all(
      // eslint-disable-next-line consistent-return
      resp.data.values.map(async step => {
        // We don't have control of the last step, it is a edge case.
        // In the after_script, the last step is still 'IN-PROGRESS' but the result of the last step does not matter.
        // We use the process.env.BITBUCKET_EXIT_CODE to determine the status of the pipeline.
        if (step && step.state) {
          // eslint-disable-next-line no-nested-ternary
          const stepStatus = process.env.BITBUCKET_EXIT_CODE
            ? process.env.BITBUCKET_EXIT_CODE === '0'
              ? 'SUCCESSFUL'
              : 'FAILED'
            : step.state.result.name;
          const stepTime = await getStepTime(step, resp.data.values.length);
          return {
            step_uuid: step.uuid,
            step_command:
              step.script_commands[step.script_commands.length - 1].command,
            step_duration: stepTime,
            step_name: step.name || buildType, // on Master, there is no step name.
            step_status: stepStatus,
            duration_in_seconds: step.duration_in_seconds,
          };
        }
      }),
    );
  } catch (err) {
    console.error(err.toString());
    process.exit(1);
  }
}

/* This function returns the payload per build type. */
function returnPayloadPerBuildType(
  pipelines /*: IPipelines */,
  buildType /*: string*/,
  buildName /*: string*/,
) {
  if (buildType === 'default') {
    return {
      step_name:
        pipelines.default[0].parallel[process.env.BITBUCKET_PARALLEL_STEP].step
          .name,
      build_type: buildType,
      build_name: buildName,
    };
  }
  return {
    step_name:
      pipelines.custom[buildName][0].parallel[
        process.env.BITBUCKET_PARALLEL_STEP
      ].step.name,
    build_type: buildType,
    build_name: buildName,
  };
}

/* This function identifies the step currently running and build a partial payload based on the build type.*/
async function getStepNamePerBuildType(buildId /*: string */) {
  try {
    const config = yaml.safeLoad(
      fs.readFileSync('bitbucket-pipelines.yml', 'utf8'),
    );
    const indentedJson = JSON.parse(JSON.stringify(config, null, 4));
    const apiEndpoint = `https://api.bitbucket.org/2.0/repositories/${BITBUCKET_REPO_FULL_NAME}/pipelines/${buildId}`;
    const res = await axios.get(apiEndpoint, axiosRequestConfig);
    const buildType = res.data.target.selector.type || 'default';
    const buildName =
      res.data.target.selector.pattern || res.data.target.ref_name;
    // Master branch is not returning data per step but per build.
    if (buildName === 'master') return;
    // Only the 3 types of build below will have parallel steps.
    // process.env.BITBUCKET_PARALLEL_STEP returns zero-based index of the current step in the group, for example: 0, 1, 2, … - only for parallel step.
    // This will return the actual step where the build is currently running.
    // eslint-disable-next-line consistent-return
    return returnPayloadPerBuildType(
      indentedJson.pipelines,
      buildType,
      buildName,
    );
  } catch (e) {
    console.log(e);
  }
}

/* This function the final step payload when a build with parallel step is running in Bitbucket.*/
// eslint-disable-next-line consistent-return
async function getStepEvents(buildId /*: string*/) {
  const stepsUrl = `https://api.bitbucket.org/2.0/repositories/${BITBUCKET_REPO_FULL_NAME}/pipelines/${buildId}/steps/`;
  try {
    const stepPayload = await getStepNamePerBuildType(buildId);
    const res = await axios.get(stepsUrl, axiosRequestConfig);
    // Filter returns an array and we need the first value.
    if (stepPayload) {
      const stepObject = res.data.values.filter(
        step => step.name === stepPayload.step_name,
      )[0];
      // eslint-disable-next-line no-nested-ternary
      const buildStatus = process.env.BITBUCKET_EXIT_CODE
        ? process.env.BITBUCKET_EXIT_CODE === '0'
          ? 'SUCCESSFUL'
          : 'FAILED'
        : stepObject.state.result.name;
      const stepTime = await getStepTime(stepObject, stepObject.length);
      // Build type and build name are confused for custom build.
      const buildType =
        stepPayload.build_type === 'custom'
          ? stepPayload.build_name
          : stepPayload.build_type;
      return {
        build_number: buildId,
        build_status: buildStatus,
        build_time: stepTime,
        build_name: stepPayload.build_name,
        build_number_steps: stepObject.length,
        build_type: buildType,
        build_steps: [
          {
            step_uuid: stepObject.uuid,
            step_command:
              stepObject.script_commands[stepObject.script_commands.length - 1]
                .command,
            step_duration: stepTime,
            step_status: buildStatus,
            step_name: stepObject.name || stepPayload.build_type, // if there is one step and no step name, we can refer to the build type.
          },
        ],
      };
    }
  } catch (err) {
    console.error(err.toString());
    process.exit(1);
  }
}

module.exports = { getPipelinesBuildEvents, getStepEvents };
