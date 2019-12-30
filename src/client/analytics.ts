import env from '../shared/env';
import GA from 'react-ga';

if (env.googleAnalyticsID) {
  GA.initialize(env.googleAnalyticsID, {
    titleCase: false,
    gaOptions: {
      siteSpeedSampleRate: 100,
    },
  });
}

export function analyticsSceneView(sceneId: string) {
  if (!env.googleAnalyticsID) return;

  GA.pageview('/_ga/' + sceneId);
}
export function analyticsEndingView(sceneId: string) {
  if (!env.googleAnalyticsID) return;

  GA.event({
    category: 'Endings',
    action: sceneId,
  });
}
export function analyticsSubmit(sceneId: string) {
  if (!env.googleAnalyticsID) return;

  GA.event({
    category: 'Requests',
    action: 'Request',
    label: sceneId,
  });
}
export function analytics() {
  if (!env.googleAnalyticsID) return;
}
