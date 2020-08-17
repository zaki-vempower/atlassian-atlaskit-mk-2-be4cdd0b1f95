import { Device, snapshot, initFullPageEditorWithAdf } from '../_utils';
import * as adfWithExpand from './__fixtures__/simple-expand.adf.json';
import { Page } from '../../__helpers/page-objects/_types';
import { clickEditableContent } from '../../__helpers/page-objects/_editor';
import { pressKey } from '../../__helpers/page-objects/_keyboard';

describe('Expand: tab navigation', () => {
  let page: Page;

  beforeAll(async () => {
    // @ts-ignore
    page = global.page;
  });

  afterEach(async () => {
    await snapshot(page);
  });

  describe('given the gap cursor is on the left of the expand', () => {
    beforeEach(async () => {
      await initFullPageEditorWithAdf(page, adfWithExpand, Device.LaptopMDPI);
      await clickEditableContent(page);
      await pressKey(page, ['ArrowUp', 'ArrowUp']);
    });

    describe('when tab is pressed once', () => {
      it('should create a node selection on the expand', async () => {
        await pressKey(page, ['Tab']);
      });
    });

    describe('when tab is pressed twice', () => {
      it('should focus on the button', async () => {
        await pressKey(page, ['Tab', 'Tab']);
      });

      describe('when button is focused', () => {
        describe('and enter is pressed', () => {
          it('should collapse the expand', async () => {
            await pressKey(page, ['Tab', 'Tab', 'Enter']);
          });
        });

        describe('and space is pressed', () => {
          it('should collapse the expand', async () => {
            await pressKey(page, ['Tab', 'Tab', 'Space']);
          });
        });
      });
    });

    describe('when tab is pressed thrice', () => {
      it('should focus on title', async () => {
        await pressKey(page, ['Tab', 'Tab', 'Tab']);
        await page.keyboard.type('I am here');
      });
    });

    describe('when tab is pressed four times', () => {
      describe('when expand is opened', () => {
        it('should focus on content', async () => {
          await pressKey(page, ['Tab', 'Tab', 'Tab', 'Tab']);
          await page.keyboard.type('I am here');
        });
      });

      describe('when expand is closed', () => {
        it('should focus outside', async () => {
          await pressKey(page, ['Tab', 'Tab', 'Space', 'Tab', 'Tab']);
          await page.keyboard.type('I am here');
        });
      });
    });
  });
});
