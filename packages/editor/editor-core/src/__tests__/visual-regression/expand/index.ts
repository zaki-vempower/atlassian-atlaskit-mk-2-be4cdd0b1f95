import { Device, snapshot, initFullPageEditorWithAdf } from '../_utils';
import { waitForLoadedBackgroundImages } from '@atlaskit/visual-regression/helper';
import {
  expandADF,
  tableMediaADF,
  nestedExpandOverflowInTable,
  wrappingMediaADF,
  mediaInExpandADF,
  mediaInNestedExpandADF,
} from './__fixtures__/expand-adf';
import { selectors } from '../../__helpers/page-objects/_expand';
import { Page } from '../../__helpers/page-objects/_types';
import { emojiReadySelector } from '../../__helpers/page-objects/_emoji';
import {
  clickFirstCell,
  tableSelectors,
} from '../../__helpers/page-objects/_table';
import { resizeMediaInPositionWithSnapshot } from '../../__helpers/page-objects/_media';

const hideTooltip = async (page: Page) => {
  // Hide the tooltip
  const css = `
 .Tooltip {
   opacity: 0 !important;
 }
`;
  await page.addStyleTag({ content: css });
};

describe('Expand: full-page', () => {
  let page: Page;

  beforeAll(async () => {
    // @ts-ignore
    page = global.page;
  });

  afterEach(async () => {
    await waitForLoadedBackgroundImages(page, emojiReadySelector, 10000);
    await snapshot(page, undefined, selectors.expand);
  });

  describe.each(['default', 'wide', 'full-width'])('Breakout: %s', mode => {
    it(`should render a ${mode} collapsed top level expand`, async () => {
      await initFullPageEditorWithAdf(page, expandADF(mode), Device.LaptopMDPI);
      await page.waitForSelector(selectors.expand);
    });
  });

  it('should collapse the top level expand on click', async () => {
    await initFullPageEditorWithAdf(page, expandADF(), Device.LaptopMDPI);
    await page.waitForSelector(selectors.expand);
    await hideTooltip(page);
    await page.click(selectors.expandToggle);
  });

  it('should render a border on hover of a collapsed top level expand', async () => {
    await initFullPageEditorWithAdf(page, expandADF(), Device.LaptopMDPI);
    await page.waitForSelector(selectors.expand);
    await hideTooltip(page);
    await page.click(selectors.expandToggle);
    await page.hover(selectors.expandTitleInput);
  });

  it('should collapse a nested expand on click', async () => {
    await initFullPageEditorWithAdf(page, expandADF(), Device.LaptopMDPI);
    await page.waitForSelector(selectors.expand);
    await page.click(selectors.nestedExpandToggle);
    await page.click(selectors.expandTitleInput);
  });

  it('table row controls should not be cut off', async () => {
    await initFullPageEditorWithAdf(page, tableMediaADF, Device.LaptopMDPI);
    await page.waitForSelector(selectors.expand);
    await clickFirstCell(page);
    await page.waitForSelector(tableSelectors.firstRowControl);
    await page.click(tableSelectors.firstRowControl);
  });

  it('expands should hide their overflow content', async () => {
    await initFullPageEditorWithAdf(
      page,
      nestedExpandOverflowInTable,
      Device.LaptopMDPI,
    );
    await page.waitForSelector(selectors.nestedExpand);
  });
});

// This block is seperate as Puppeteer has some
// issues screenshotting the expand with wrapped media.
describe('Expand: Media', () => {
  let page: Page;

  beforeAll(async () => {
    // @ts-ignore
    page = global.page;
  });

  it('should allow wrapped media to flow correctly', async () => {
    await initFullPageEditorWithAdf(page, wrappingMediaADF, Device.LaptopMDPI);
    await page.waitForSelector(selectors.expand);
    await page.click(`${selectors.expand} p`);
    await snapshot(page);
  });

  it('should not show grid lines when re-sizing inside an expand', async () => {
    await initFullPageEditorWithAdf(page, mediaInExpandADF, Device.LaptopMDPI);
    await page.waitForSelector(selectors.expand);
    await page.click('.media-single .img-wrapper');
    await resizeMediaInPositionWithSnapshot(page, 0, 50);
  });

  it('should not show grid lines when re-sizing inside a nested expand', async () => {
    await initFullPageEditorWithAdf(
      page,
      mediaInNestedExpandADF,
      Device.LaptopMDPI,
    );
    await page.waitForSelector(selectors.nestedExpand);
    await page.click('.media-single .img-wrapper');
    await resizeMediaInPositionWithSnapshot(page, 0, 50);
  });
});

describe.skip('Expand: allowInteractiveExpand', () => {
  let page: Page;

  beforeAll(async () => {
    // @ts-ignore
    page = global.page;
  });

  afterEach(async () => {
    await snapshot(page, undefined, selectors.expand);
  });

  describe('when the flag is false', () => {
    it('should disable the expand button', async () => {
      await initFullPageEditorWithAdf(
        page,
        expandADF('default'),
        Device.LaptopMDPI,
        undefined,
        {
          UNSAFE_allowExpand: {
            allowInteractiveExpand: false,
          },
        },
      );
      await page.waitForSelector(selectors.expand);
      await page.click(selectors.expandToggle);
    });
  });
});
