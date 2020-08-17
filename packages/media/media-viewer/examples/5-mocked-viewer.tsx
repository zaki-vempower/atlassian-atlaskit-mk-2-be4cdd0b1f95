import * as React from 'react';
import { canUseDOM } from 'exenv';

import { MediaClient, MediaFile, Identifier } from '@atlaskit/media-client';
import {
  MediaMock,
  defaultCollectionName,
  smallImage,
  tallImage,
  defaultBaseUrl,
  generateFilesFromTestData,
} from '@atlaskit/media-test-helpers';

import { wideImage } from '../example-helpers/assets/wide-image';
import { MediaViewer } from '../src/components/media-viewer';

let files: Array<MediaFile & { blob: Blob }> = [];

if (canUseDOM) {
  (window as any).areControlsRendered = () => {
    return !!document.querySelector('div.mvng-hide-controls');
  };

  (window as any).areControlsVisible = () => {
    const controls = document.querySelector('div.mvng-hide-controls');
    if (!controls) {
      return false;
    } else {
      return window.getComputedStyle(controls).opacity === '1';
    }
  };

  (window as any).forceShowControls = function() {
    const controls = document.querySelectorAll('.mvng-hide-controls');
    for (let i = 0; i < controls.length; i++) {
      controls[i].classList.remove('mvng-hide-controls');
    }
  };

  files = generateFilesFromTestData([
    {
      name: 'media-test-file-1.png',
      dataUri: smallImage,
    },
    {
      name: 'media-test-file-2.jpg',
      dataUri: wideImage,
    },
    {
      name: 'media-test-file-3.png',
      dataUri: tallImage,
    },
  ]);
  const mediaMock = new MediaMock({
    [defaultCollectionName]: files,
  });
  mediaMock.enable();
}
const mediaClient = new MediaClient({
  authProvider: () =>
    Promise.resolve({
      clientId: '',
      token: '',
      baseUrl: defaultBaseUrl,
    }),
});

export interface State {
  isMediaViewerActive: boolean;
}
export default class Example extends React.Component<{}, State> {
  state = {
    isMediaViewerActive: true,
  };

  deactivate = () => {
    this.setState({ isMediaViewerActive: false });
  };

  render() {
    const { isMediaViewerActive } = this.state;

    if (files.length === 0 || !isMediaViewerActive) {
      return null;
    }

    return (
      <MediaViewer
        dataSource={{
          list: files
            .map(
              ({ id }): Identifier => ({
                id,
                collectionName: defaultCollectionName,
                mediaItemType: 'file',
              }),
            )
            .concat([
              {
                mediaItemType: 'external-image',
                dataURI:
                  'https://wac-cdn.atlassian.com/dam/jcr:616e6748-ad8c-48d9-ae93-e49019ed5259/Atlassian-horizontal-blue-rgb.svg',
              },
            ]),
        }}
        selectedItem={{
          id: files[1].id,
          collectionName: defaultCollectionName,
          mediaItemType: 'file',
        }}
        collectionName={defaultCollectionName}
        mediaClient={mediaClient}
        onClose={this.deactivate}
      />
    );
  }
}
