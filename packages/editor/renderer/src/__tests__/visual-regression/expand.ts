import { Page } from 'puppeteer';
import { snapshot, initRendererWithADF, Device } from './_utils';
import { selectors } from '../__helpers/page-objects/_expand';
import { expandADF } from '../__fixtures__/expand-adf';

const initRenderer = async (page: Page, adf: any) => {
  await initRendererWithADF(page, {
    appearance: 'full-page',
    device: Device.LaptopMDPI,
    adf,
  });
};

describe('Snapshot Test: Expand', () => {
  let page: Page;
  beforeAll(() => {
    // @ts-ignore
    page = global.page;
  });

  afterEach(async () => {
    await snapshot(page, undefined, selectors.expand);
  });

  test(`should render a border on hover of a collapsed top level expand`, async () => {
    await initRenderer(page, expandADF());
    await page.waitForSelector(selectors.expand);
    await page.hover(selectors.expand);
  });

  test('should expand a collapsed top level expand on toggle', async () => {
    await initRenderer(page, expandADF());
    await page.waitForSelector(selectors.expand);
    await page.click(selectors.expandToggle);
  });

  test('should have a left aligned title when wrapped', async () => {
    await initRenderer(
      page,
      expandADF(
        undefined,
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean mi nisl, venenatis eget auctor vitae, venenatis quis lorem',
      ),
    );
    await page.waitForSelector(selectors.expand);
  });

  describe.each(['default', 'wide', 'full-width'])('Breakout: %s', mode => {
    test(`should render a ${mode} collapsed top level expand`, async () => {
      await initRenderer(page, expandADF(mode));
      await page.waitForSelector(selectors.expand);
    });

    test('should expand a collapsed nested expand on toggle', async () => {
      await initRenderer(page, expandADF(mode));
      await page.waitForSelector(selectors.expand);
      await page.click(selectors.expandToggle);
      await page.click(selectors.nestedExpandToggle);
    });
  });
});
