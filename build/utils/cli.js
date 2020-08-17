// @flow
const editor = require('editor');
const uuid = require('uuid/v1');
const inquirer = require('inquirer');
const fuzzy = require('fuzzy');

inquirer.registerPrompt(
  'checkbox-plus',
  require('inquirer-checkbox-plus-prompt'),
);

/* Notes on using inquirer:
 * Each question needs a key, as inquirer is assembling an object behind-the-scenes.
 * At each call, the entire responses object is returned, so we need a unique
 * identifier for the name every time. This is why we are using UUIDs.
 */

async function askCheckboxPlus(message /*:string */, choices /*: string[]*/) {
  const name = `CheckboxPlus-${uuid()}`;

  // wraps fuzzyfilter, and removes inquirer sepearators/other data invalid to
  // fuzzy.
  function fuzzySearch(answersSoFar, input) {
    // eslint-disable-next-line consistent-return
    return new Promise(resolve => {
      if (!input) return resolve(choices);
      const fuzzyResult = fuzzy.filter(
        input,
        choices.filter(choice => typeof choice === 'string'),
      );
      const data = fuzzyResult.map(element => element.original);

      resolve(data);
    });
  }

  return inquirer
    .prompt([
      {
        message,
        name,
        searchable: true,
        pageSize: 10,
        type: 'checkbox-plus',
        source: fuzzySearch,
      },
    ])
    .then(responses => responses[name]);
}

async function askQuestion(message /*:string */) {
  const name = `Question-${uuid()}`;

  return inquirer
    .prompt([
      {
        message,
        name,
      },
    ])
    .then(responses => responses[name]);
}

// eslint-disable-next-line no-unused-vars
async function askAutoComplete(message /*:string[] */) {
  const name = `Autocmplete-${uuid()}`;

  return inquirer
    .prompt([
      {
        message,
        name,
        type: 'confirm',
      },
    ])
    .then(responses => responses[name]);
}

async function askConfirm(message /*:string[] */) {
  const name = `Confirm-${uuid()}`;

  return inquirer
    .prompt([
      {
        message,
        name,
        type: 'confirm',
      },
    ])
    .then(responses => responses[name]);
}

async function askList(message /*:string */, choices /*: string[]*/) {
  const name = `List-${uuid()}`;

  return inquirer
    .prompt([
      {
        choices,
        message,
        name,
        type: 'list',
      },
    ])
    .then(responses => responses[name]);
}

async function askCheckbox(message /*:string */, choices /*: string[]*/) {
  const name = `Checkbox-${uuid()}`;

  return inquirer
    .prompt([
      {
        choices,
        message,
        name,
        type: 'checkbox',
      },
    ])
    .then(responses => responses[name])
    .catch(e => console.log('can we do this?', e));
}

async function askEditor(pathToFile /*: string */) {
  return new Promise((resolve, reject) => {
    editor(pathToFile, code => {
      if (code === 0) resolve();
      reject();
    });
  });
}

module.exports = {
  askCheckboxPlus,
  askQuestion,
  askConfirm,
  askList,
  askCheckbox,
  askEditor,
};
