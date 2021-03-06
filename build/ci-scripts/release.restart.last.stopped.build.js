#!/usr/bin/env node
// @flow
const axios = require('axios');

/*
   This script queries pipelines and checks the most recent master* builds. If the most recent one
   was "stopped" or "failed" (not pending or running), then we tell pipelines to restart that
   pipeline.

   This script should be called at the very END of a master* build so that stopped builds will still
   get run after the last build finishes.

   *The script will automatically work for any branch it is run in, which is useful for testing.
*/

const BUILDS_TO_FETCH = 10;

const {
  BITBUCKET_BRANCH,
  BITBUCKET_USER,
  BITBUCKET_PASSWORD,
  BITBUCKET_REPO_FULL_NAME,
} = process.env;

if (
  !BITBUCKET_REPO_FULL_NAME ||
  !BITBUCKET_USER ||
  !BITBUCKET_PASSWORD ||
  !BITBUCKET_BRANCH
) {
  throw Error(
    '$BITBUCKET_REPO_FULL_NAME or $BITBUCKET_USER or $BITBUCKET_PASSWORD  or $BITBUCKET_BRANCH environment variables are not set',
  );
}

const PIPELINES_ENDPOINT = `https://api.bitbucket.org/2.0/repositories/${BITBUCKET_REPO_FULL_NAME}/pipelines/`;

const axiosRequestConfig = {
  auth: {
    username: BITBUCKET_USER,
    password: BITBUCKET_PASSWORD,
  },
  params: {
    pagelen: BUILDS_TO_FETCH,
    // get the most recent builds first
    sort: '-created_on',
    'target.ref_name': BITBUCKET_BRANCH,
    'target.ref_type': 'BRANCH',
  },
};

function pipelineFailedOrStopped(pipelineState) {
  // the state will have a name of 'PENDING', 'COMPLETED' or 'IN_PROGRESS'
  // if it is COMPLETED the state also has a result.name of 'SUCCESSFUL', 'FAILED' or 'STOPPED'
  if (pipelineState.name === 'FAILED') {
    return true;
  }
  if (
    pipelineState.name === 'COMPLETED' &&
    pipelineState.result.name === 'STOPPED'
  ) {
    return true;
  }
  return false;
}

axios
  .get(PIPELINES_ENDPOINT, axiosRequestConfig)
  .then(response => {
    const allRunningPipelines = response.data.values;
    const nonScheduled = allRunningPipelines.filter(
      build => build.trigger.name !== 'SCHEDULE',
    );

    // we have a list of pipelines sorted by creation date. At this point we just need to get the
    // latest one and:
    //   if it is stopped: restart it
    //   if it is failed (should be suuuuper rare): restart it
    //   if it is pending: we can safely exit (it will pick up all other stopped builds)
    //   if it pipeline is running:
    //    - we are either looking at ourselves (we can safely exit)
    //    - or we are looking at a new build which is going to pick up the work (we can safely exit)
    const mostRecentPipeline = nonScheduled[0];
    const pipelineState = mostRecentPipeline.state;

    if (pipelineFailedOrStopped(pipelineState)) {
      console.log(
        'There is a stopped or failed pipeline created after this one.',
      );
      console.log('Restarting it now.');
      const postData = {
        target: {
          commit: {
            type: 'commit',
            hash: mostRecentPipeline.target.commit.hash,
          },
          ref_name: BITBUCKET_BRANCH,
          ref_type: 'branch',
          type: 'pipeline_ref_target',
        },
      };
      return axios.post(PIPELINES_ENDPOINT, postData, {
        auth: {
          username: BITBUCKET_USER,
          password: BITBUCKET_PASSWORD,
        },
      });
    }
    return Promise.resolve();
  })
  .then(response => {
    if (response && response.status === 201) {
      const newPipelinesUUID = response.data.uuid;
      const newPipelineURL = `https://bitbucket.org/atlassian/atlaskit/addon/pipelines/home#!/results/${newPipelinesUUID}`;
      console.log(`Successfully restarted pipeline at: ${newPipelineURL}`);
    }
  })
  .catch(err => {
    console.error(err.message);
    process.exit(1);
  });
