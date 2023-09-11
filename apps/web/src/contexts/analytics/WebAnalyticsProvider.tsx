import { captureException } from '@sentry/nextjs';
import mixpanel from 'mixpanel-browser';
import { memo, ReactNode } from 'react';

import AnalyticsProvider, {
  IdentifyFunction,
  RegisterSuperPropertiesFunction,
  TrackFunction,
} from '~/shared/contexts/AnalyticsContext';

let mixpanelEnabled = false;

if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN && process.env.NEXT_PUBLIC_ANALYTICS_API_URL) {
  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
    api_host: process.env.NEXT_PUBLIC_ANALYTICS_API_URL,
  });
  mixpanelEnabled = true;
}

// raw tracking. use this sparingly if you can't use hooks, or are outside the analytics context.
export const _track: TrackFunction = (eventName, eventProps) => {
  if (!mixpanelEnabled) return;

  try {
    // Apparently mixpanel mutates eventProps so we need to clone it to make
    // sure we don't affect downstream code.
    mixpanel.track(eventName, { ...eventProps });
  } catch (error: unknown) {
    // mixpanel errors shouldn't disrupt app
    captureException(error);
  }
};

export const _identify: IdentifyFunction = (userId) => {
  if (!mixpanelEnabled) return;

  try {
    mixpanel.identify(userId);
  } catch (error: unknown) {
    // mixpanel errors shouldn't disrupt app
    captureException(error);
  }
};

export const _registerSuperProperties: RegisterSuperPropertiesFunction = (eventProps) => {
  if (!mixpanelEnabled) return;

  try {
    mixpanel.register(eventProps);
  } catch (error: unknown) {
    // mixpanel errors shouldn't disrupt app
    captureException(error);
  }
};

type Props = { children: ReactNode };

const WebAnalyticsProvider = memo(({ children }: Props) => {
  return (
    <AnalyticsProvider
      track={_track}
      identify={_identify}
      registerSuperProperties={_registerSuperProperties}
    >
      {children}
    </AnalyticsProvider>
  );
});

WebAnalyticsProvider.displayName = 'WebAnalyticsProvider';

export default WebAnalyticsProvider;
