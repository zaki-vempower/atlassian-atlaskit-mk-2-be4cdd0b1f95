import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { determineMode } from './bridge-utils';
import { EditorActions, EditorContext } from '@atlaskit/editor-core';
import {
  EditorPresetMobile,
  Mobile as MobileEditor,
} from '@atlaskit/editor-core/labs-next';
import { AtlaskitThemeProvider } from '@atlaskit/theme/components';
import { Provider as SmartCardProvider } from '@atlaskit/smart-card';
import { analyticsBridgeClient } from './analytics-client';
import FabricAnalyticsListeners, {
  AnalyticsWebClient,
} from '@atlaskit/analytics-listeners';
import { toNativeBridge } from './editor/web-to-native';
import WebBridgeImpl from './editor/native-to-web';
import { cardClient } from './providers/cardProvider';
import { EditorViewWithComposition } from './types';
import {
  initPluginListeners,
  destroyPluginListeners,
} from './editor/plugin-subscription';
import { providerFactory } from './providers';
import MobilePicker from './editor/MobileMediaPicker';
import { ProviderFactoryProvider } from '@atlaskit/editor-common/provider-factory';

// Expose WebBridge instance for use by native side
const bridge = new WebBridgeImpl();
window.bridge = bridge;

function main(window: Window, document: Document) {
  const params = new URLSearchParams(window.location.search);
  const mode = determineMode(params.get('mode'));

  const actions = bridge.editorActions;

  const analyticsClient = analyticsBridgeClient(event => {
    toNativeBridge.call('analyticsBridge', 'trackEvent', {
      event: JSON.stringify(event),
    });
  });

  const mediaPicker = new MobilePicker();

  ReactDOM.render(
    <MobileEditorArchV3
      editorActions={bridge.editorActions}
      mode={mode}
      mediaPicker={mediaPicker}
      analyticsClient={analyticsClient}
      onChange={() => {
        toNativeBridge.updateText(bridge.getContent());
      }}
      onMount={actions => {
        const view = actions._privateGetEditorView() as EditorViewWithComposition;
        const eventDispatcher = actions._privateGetEventDispatcher()!;
        bridge.editorView = view;
        bridge.editorActions._privateRegisterEditor(view, eventDispatcher);
        bridge.mediaPicker = mediaPicker;
        initPluginListeners(eventDispatcher, bridge, view);
      }}
      onDestroy={() => {
        destroyPluginListeners(actions._privateGetEventDispatcher()!, bridge);
        bridge.editorActions._privateUnregisterEditor();
        bridge.editorView = null;
        bridge.mentionsPluginState = null;
      }}
    />,
    document.getElementById('editor'),
  );
}

interface MobileEditorArchV3Props {
  editorActions: EditorActions;
  mode: 'dark' | 'light';
  mediaPicker: MobilePicker;
  analyticsClient: AnalyticsWebClient;
  onDestroy?(): void;
  onChange?(content: any): void;
  onMount?(actions: EditorActions): void;
}

function MobileEditorArchV3(props: MobileEditorArchV3Props): JSX.Element {
  return (
    <ProviderFactoryProvider value={providerFactory}>
      <FabricAnalyticsListeners client={props.analyticsClient}>
        {/* Temporarily opting out of the default oauth2 flow for phase 1 of Smart Links */}
        {/* See https://product-fabric.atlassian.net/browse/FM-2149 for details. */}
        <SmartCardProvider client={cardClient} authFlow="disabled">
          <AtlaskitThemeProvider mode={props.mode}>
            <EditorPresetMobile
              media={{
                picker: props.mediaPicker,
              }}
            >
              <EditorContext editorActions={props.editorActions}>
                <MobileEditor
                  onChange={props.onChange}
                  onDestroy={props.onDestroy}
                  onMount={props.onMount}
                />
              </EditorContext>
            </EditorPresetMobile>
          </AtlaskitThemeProvider>
        </SmartCardProvider>
      </FabricAnalyticsListeners>
    </ProviderFactoryProvider>
  );
}

document.addEventListener('DOMContentLoaded', () => main(window, document));
