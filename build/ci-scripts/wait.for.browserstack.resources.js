// @flow
const axios = require('axios');
const util = require('util');
/**
 * NOTE: This utility will manage the browserstack build queues.
 * It checks the number of build running in BS and if the number is greater than the X limit, it will retry after Y time.
 * The goal is to prevent Browserstack to be hammered and reduce the number of timeout for users.
 * */
const numberOfTries = Number(process.env.BS_RETRY) || 3;
const percentageOfSessionsAllowed =
  Number(process.env.BS_SESSIONS_ALLOWED) || 50; // This number represents the percentage of sessions allowed.
const user = process.env.BROWSERSTACK_USERNAME || '';
const key = process.env.BROWSERSTACK_KEY || '';
const auth = Buffer.from(`${user}:${key}`).toString('base64');

const sleep = util.promisify(setTimeout);

function checkBSParallelSessions() {
  return (
    axios
      .get('https://api.browserstack.com/automate/plan.json', {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      })
      // eslint-disable-next-line consistent-return
      .then(response => {
        // Those two values are int and fixed on BS sides, so it should be always returning a proper value.
        const percentageOfUsedSessions = Math.floor(
          (response.data.parallel_sessions_running /
            response.data.team_parallel_sessions_max_allowed) *
            100,
        );
        if (percentageOfUsedSessions > percentageOfSessionsAllowed) {
          return Promise.reject(
            new Error(
              `Browserstack is currently running with ${percentageOfUsedSessions} % of used sessions concurrently, the limit is ${percentageOfSessionsAllowed} %, please try again later`,
            ),
          );
        }
      })
  );
}

async function main() {
  for (let i = 0; i < numberOfTries; i++) {
    try {
      await checkBSParallelSessions();
      process.exit(0);
    } catch (e) {
      console.log(e);
      await sleep(10000 * 2 ** i);
    }
  }
  process.exit(1);
}
main();
