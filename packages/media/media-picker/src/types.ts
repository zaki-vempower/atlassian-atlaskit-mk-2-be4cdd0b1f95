import { MediaClient } from '@atlaskit/media-client';
import { UploadEventEmitter } from './components/component';
import { LocalUploadConfig } from './components/types';
import { AppProxyReactContext } from './popup/components/app';
import { EventEmitter } from './util/eventEmitter';

export interface UploadParams {
  collection?: string;
}

export type MediaFile = {
  readonly id: string;
  readonly name: string;
  readonly size: number;
  readonly creationDate: number;
  readonly type: string;
  readonly occurrenceKey?: string;
};

export type NonImagePreview = {
  readonly file?: Blob;
};
export type ImagePreview = NonImagePreview & {
  readonly dimensions: {
    readonly width: number;
    readonly height: number;
  };
  readonly scaleFactor: number;
};
export type Preview = NonImagePreview | ImagePreview;

export type UploadsStartEventPayload = {
  readonly files: MediaFile[];
};

export type UploadStatusUpdateEventPayload = {
  readonly file: MediaFile;
  readonly progress: MediaProgress;
};

export type UploadPreviewUpdateEventPayload = {
  readonly file: MediaFile;
  readonly preview: Preview;
};

export type UploadProcessingEventPayload = {
  readonly file: MediaFile;
};

export type UploadEndEventPayload = {
  readonly file: MediaFile;
};

export type UploadErrorEventPayload = {
  readonly file: MediaFile;
  readonly error: MediaError;
};

// Events public API
export type UploadEventPayloadMap = {
  readonly 'uploads-start': UploadsStartEventPayload;
  readonly 'upload-preview-update': UploadPreviewUpdateEventPayload;
  readonly 'upload-status-update': UploadStatusUpdateEventPayload;
  readonly 'upload-processing': UploadProcessingEventPayload;
  readonly 'upload-end': UploadEndEventPayload;
  readonly 'upload-error': UploadErrorEventPayload;
};

export interface PopupConfig extends LocalUploadConfig {
  readonly container?: HTMLElement;
  readonly proxyReactContext?: AppProxyReactContext;
  readonly singleSelect?: boolean;
}

export interface Popup
  extends UploadEventEmitter,
    EventEmitter<PopupUploadEventPayloadMap> {
  show(): Promise<void>;
  cancel(uniqueIdentifier?: string | Promise<string>): Promise<void>;
  teardown(): void;
  hide(): void;
  setUploadParams(uploadParams: UploadParams): void;
  emitClosed(): void;
}

export interface BrowserConfig extends LocalUploadConfig {
  readonly multiple?: boolean;
  readonly fileExtensions?: Array<string>;
}

export interface ClipboardConfig extends LocalUploadConfig {}

export interface PopupConfig extends LocalUploadConfig {
  readonly container?: HTMLElement;
  readonly proxyReactContext?: AppProxyReactContext;
  readonly singleSelect?: boolean;
}

export interface PopupConstructor {
  new (mediaClient: MediaClient, config: PopupConfig): Popup;
}

export interface DropzoneConfig extends LocalUploadConfig {
  container?: HTMLElement;
  headless?: boolean;
}

export type PopupUploadEventPayloadMap = UploadEventPayloadMap & {
  readonly closed: undefined;
};

export interface MediaProgress {
  absolute: number;
  portion: number;
  max: number;
  overallTime: number;
  expectedFinishTime: number;
  timeLeft: number;
}

export type MediaErrorName =
  | 'object_create_fail'
  | 'metadata_fetch_fail'
  | 'token_fetch_fail'
  | 'token_update_fail'
  | 'token_source_empty'
  | 'upload_fail'
  | 'user_token_fetch_fail'
  | 'remote_upload_fail';

export type MediaError = {
  readonly fileId?: string;
  readonly name: MediaErrorName;
  readonly description: string;
};
