// @flow
const fs = require('fs');
const updateBuildStatus = require('../utils/updateBuildStatus');

const netlifyLinkPath = './netlify-link.txt';

try {
  if (!fs.existsSync(netlifyLinkPath)) {
    console.error('Unable to find netlify-link.txt file');
    process.exit(1);
  }
  const netlifyUrl = fs.readFileSync(netlifyLinkPath, 'utf-8');

  const buildStatusOpts = {
    buildName: 'Netlify build',
    description: 'A static preview build hosted on netlify',
    url: netlifyUrl,
    state: 'SUCCESSFUL',
  };

  console.log('Updating build status with link: ', netlifyUrl);
  // TODO: to discuss with Luke as some keys are missing.
  // $FlowFixMe - issue with some missing property in the object
  updateBuildStatus(buildStatusOpts);
} catch (e) {
  console.error('Unable to update build status');
  console.error(e.toString());
}
