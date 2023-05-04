import { captureException } from '@sentry/nextjs';
import mixpanel from 'mixpanel-browser';
import { memo, ReactNode } from 'react';

import AnalyticsProvider, {
  IdentifyFunction,
  TrackFunction,
} from '~/shared/contexts/AnalyticsContext';

let mixpanelEnabled = true;

if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN && process.env.NEXT_PUBLIC_ANALYTICS_API_URL) {
  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
    api_host: process.env.NEXT_PUBLIC_ANALYTICS_API_URL,
  });
  mixpanelEnabled = true;
}

// raw tracking. use this sparingly if you can't use hooks, or are outside the analytics context.
export const _track: TrackFunction = (eventName, eventProps, userId) => {
  if (!mixpanelEnabled) return;

  try {
    mixpanel.track(eventName, {
      userId, // field will be `null` if no user ID exists
      ...eventProps,
    });
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

type Props = { children: ReactNode };

const WebAnalyticsProvider = memo(({ children }: Props) => {
  return (
    <AnalyticsProvider track={_track} identify={_identify}>
      {children}
    </AnalyticsProvider>
  );
});

WebAnalyticsProvider.displayName = 'WebAnalyticsProvider';

export default WebAnalyticsProvider;
