import analyticsPlugin, { analyticsPluginKey as pluginKey } from './plugin';
import { FabricChannel } from '@atlaskit/analytics-listeners';

export const analyticsEventKey = 'EDITOR_ANALYTICS_EVENT';
export const editorAnalyticsChannel = FabricChannel.editor;

export * from './types';
export {
  DispatchAnalyticsEvent,
  FireAnalyticsEvent,
  HigherOrderCommand,
  withAnalytics,
  addAnalytics,
  findInsertLocation,
  fireAnalyticsEvent,
  getAnalyticsEventsFromTransaction,
  getSelectionType,
  getStateContext,
  ruleWithAnalytics,
  FireAnalyticsCallback,
} from './utils';

export const analyticsPluginKey = pluginKey;
export default analyticsPlugin;
