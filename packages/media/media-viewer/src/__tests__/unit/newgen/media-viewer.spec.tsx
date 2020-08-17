const mediaViewerModule = require.requireActual(
  '../../../newgen/analytics/media-viewer',
);
const mediaViewerModalEventSpy = jest.fn();
const mockMediaViewer = {
  ...mediaViewerModule,
  mediaViewerModalEvent: mediaViewerModalEventSpy,
};
jest.mock('../../../newgen/analytics/media-viewer', () => mockMediaViewer);

import * as React from 'react';
import { mount } from 'enzyme';
import { Subject } from 'rxjs/Subject';
import Button from '@atlaskit/button';
import { Shortcut } from '@atlaskit/media-ui';
import { FileItem, Identifier } from '@atlaskit/media-client';
import {
  KeyboardEventWithKeyCode,
  fakeMediaClient,
  asMock,
} from '@atlaskit/media-test-helpers';
import { AnalyticsListener } from '@atlaskit/analytics-next';
import EditorPanelIcon from '@atlaskit/icon/glyph/editor/panel';
import {
  MediaViewer,
  MediaViewerComponent,
} from '../../../newgen/media-viewer';
import { CloseButtonWrapper, SidebarWrapper } from '../../../newgen/styled';
import Header from '../../../newgen/header';
import { ItemSource } from '../../../newgen/domain';
import { Observable } from 'rxjs';
import { List } from '../../../newgen/list';
import {
  MediaViewerProps,
  MediaViewerExtensions,
} from '../../../components/types';

function createFixture(
  items: Identifier[],
  identifier: Identifier,
  overrides?: Partial<MediaViewerProps>,
) {
  const subject = new Subject<FileItem>();
  const mediaClient = fakeMediaClient();
  asMock(mediaClient.file.getFileState).mockReturnValue(Observable.never());
  const onClose = jest.fn();
  const itemSource: ItemSource = {
    kind: 'ARRAY',
    items,
  };
  const onEvent = jest.fn();
  const el = mount(
    <AnalyticsListener channel="media" onEvent={onEvent}>
      <MediaViewer
        selectedItem={identifier}
        itemSource={itemSource}
        mediaClient={mediaClient}
        onClose={onClose}
        {...overrides}
      />
    </AnalyticsListener>,
  );
  return { subject, el, onClose, onEvent };
}

describe('<MediaViewer />', () => {
  const identifier: Identifier = {
    id: 'some-id',
    occurrenceKey: 'some-custom-occurrence-key',
    mediaItemType: 'file',
  };
  const identifier2: Identifier = {
    id: 'some-id-2',
    occurrenceKey: 'some-custom-occurrence-key-2',
    mediaItemType: 'file',
  };

  it.skip('should close Media Viewer on ESC shortcut', () => {
    const { onClose } = createFixture([identifier], identifier);
    const e = new KeyboardEventWithKeyCode('keydown', {
      bubbles: true,
      cancelable: true,
      keyCode: 27,
    });
    document.dispatchEvent(e);
    expect(onClose).toHaveBeenCalled();
  });

  it('should not close Media Viewer when clicking on the Header', () => {
    const { el, onClose } = createFixture([identifier], identifier);
    el.find(Header).simulate('click');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should always render the close button', () => {
    const { el, onClose } = createFixture([identifier], identifier);

    expect(el.find(CloseButtonWrapper)).toHaveLength(1);
    el.find(CloseButtonWrapper)
      .find(Button)
      .simulate('click');
    expect(onClose).toHaveBeenCalled();
  });

  describe('Analytics', () => {
    it('should trigger the screen event when the component loads', () => {
      createFixture([identifier], identifier);
      expect(mediaViewerModalEventSpy).toHaveBeenCalled();
    });

    it('should send analytics when closed with button', () => {
      const { el, onEvent } = createFixture([identifier], identifier);

      expect(el.find(CloseButtonWrapper)).toHaveLength(1);
      el.find(CloseButtonWrapper)
        .find(Button)
        .simulate('click');
      expect(onEvent).toHaveBeenCalled();
      const closeEvent: any =
        onEvent.mock.calls[onEvent.mock.calls.length - 1][0];
      expect(closeEvent.payload.attributes.input).toEqual('button');
    });

    it('should send analytics when closed with esc key', () => {
      const { el, onEvent } = createFixture([identifier], identifier);

      expect(el.find(Shortcut)).toHaveLength(1);
      const handler: any = el.find(Shortcut).prop('handler');
      handler({
        keyCode: 27,
      });
      expect(onEvent).toHaveBeenCalled();
      const closeEvent: any =
        onEvent.mock.calls[onEvent.mock.calls.length - 1][0];
      expect(closeEvent.payload.attributes.input).toEqual('escKey');
    });
  });

  describe('Sidebar integration', () => {
    function MySidebarContent(props: any) {
      return <div />;
    }

    const mockSidebarRenderer = jest
      .fn()
      .mockImplementation(identifier => (
        <MySidebarContent identifier={identifier} />
      ));

    const extensions: MediaViewerExtensions = {
      sidebar: {
        icon: <EditorPanelIcon label="sidebar" />,
        renderer: mockSidebarRenderer,
      },
    };
    const items = [identifier, identifier2];

    describe('renderer', () => {
      it('should not be visible by default', () => {
        const { el } = createFixture(items, identifier, { extensions });
        expect(el.find(SidebarWrapper).exists()).toBe(false);
      });

      it('should render sidebar with selected identifier in state', () => {
        const { el } = createFixture(items, identifier, { extensions });
        el.find(MediaViewerComponent).setState({
          isSidebarVisible: true,
          selectedIdentifier: identifier2,
        });
        expect(el.find(SidebarWrapper).exists()).toBe(true);
        expect(mockSidebarRenderer).toHaveBeenCalledWith(identifier2, {
          close: expect.any(Function),
        });
      });

      it('should render sidebar with default selected identifier if not set in state', () => {
        const { el } = createFixture(items, identifier, { extensions });
        el.find(MediaViewerComponent).setState({
          isSidebarVisible: true,
        });
        expect(el.find(SidebarWrapper).exists()).toBe(true);
        expect(mockSidebarRenderer).toHaveBeenCalledWith(identifier, {
          close: expect.any(Function),
        });
      });

      it('should not show sidebar if extensions prop is not defined', () => {
        const { el } = createFixture(items, identifier, {
          extensions: undefined,
        });
        el.find(MediaViewerComponent).setState({
          isSidebarVisible: true,
          selectedIdentifier: identifier2,
        });
        expect(el.find(SidebarWrapper).exists()).toBe(false);
      });

      it('should not show sidebar if sidebarRenderer is not defined within the extensions prop', () => {
        const { el } = createFixture(items, identifier, { extensions: {} });
        el.find(MediaViewerComponent).setState({
          isSidebarVisible: true,
          selectedIdentifier: identifier2,
        });
        expect(el.find(SidebarWrapper).exists()).toBe(false);
      });
    });

    describe('toggling visibility', () => {
      it('should show sidebar if sidebar is currently not visible', () => {
        const { el } = createFixture(items, identifier, { extensions });
        el.find(List).prop('onSidebarButtonClick')!();
        expect(el.find(MediaViewerComponent).state('isSidebarVisible')).toBe(
          true,
        );
      });

      it('should hide sidebar if sidebar is currently visible', () => {
        const { el } = createFixture(items, identifier, { extensions });
        el.find(MediaViewerComponent).setState({
          isSidebarVisible: true,
        });
        el.find(List).prop('onSidebarButtonClick')!();
        expect(el.find(MediaViewerComponent).state('isSidebarVisible')).toBe(
          false,
        );
      });
    });
  });
});
