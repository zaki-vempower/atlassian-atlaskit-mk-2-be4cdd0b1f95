import { BrowserTestCase } from '@atlaskit/webdriver-runner/runner';
import { testMediaFileId } from '@atlaskit/editor-test-helpers';
import { editable, getDocFromElement, fullpage } from '../_helpers';
import {
  goToEditorTestingExample,
  mountEditor,
} from '../../__helpers/testing-example-helpers';

const baseADF = {
  version: 1,
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'asdasdas',
        },
      ],
    },
    {
      type: 'mediaSingle',
      attrs: {
        width: 66.67,
        layout: 'wrap-left',
      },
      content: [
        {
          type: 'media',
          attrs: {
            id: testMediaFileId,
            type: 'file',
            collection: 'MediaServicesSample',
            width: 2378,
            height: 628,
          },
        },
      ],
    },
    {
      type: 'mediaSingle',
      attrs: {
        width: 66.67,
        layout: 'wrap-right',
      },
      content: [
        {
          type: 'media',
          attrs: {
            id: testMediaFileId,
            type: 'file',
            collection: 'MediaServicesSample',
            width: 2378,
            height: 628,
          },
        },
      ],
    },
    {
      type: 'mediaSingle',
      attrs: {
        width: 41.666666666666664,
        layout: 'wrap-left',
      },
      content: [
        {
          type: 'media',
          attrs: {
            id: testMediaFileId,
            type: 'file',
            collection: 'MediaServicesSample',
            width: 2378,
            height: 628,
          },
        },
      ],
    },
    {
      type: 'paragraph',
      content: [],
    },
  ],
};

BrowserTestCase(
  'copy-mediaSingle-replacement.ts: Copies and pastes mediaSingle on fullpage',
  { skip: ['edge', 'ie', 'safari'] },
  async (
    client: Parameters<typeof goToEditorTestingExample>[0],
    testCase: string,
  ) => {
    const page = await goToEditorTestingExample(client);
    await mountEditor(page, {
      appearance: fullpage.appearance,
      defaultValue: JSON.stringify(baseADF),
      media: {
        allowMediaSingle: true,
      },
    });

    // select the middle one and copy it
    //
    // uses .overlay since these error without being signed into Media Services
    // use the .wrapper selector if we're able to resolve the image
    await page.waitForSelector('.ProseMirror :nth-child(3) .wrapper');
    await page.click('.ProseMirror :nth-child(3) .wrapper');
    await page.copy();

    // select the last one and replace it
    await page.waitForSelector('.ProseMirror :nth-child(4) .wrapper');
    await page.click('.ProseMirror :nth-child(4) .wrapper');
    await page.paste();

    const doc = await page.$eval(editable, getDocFromElement);
    expect(doc).toMatchCustomDocSnapshot(testCase);
  },
);
