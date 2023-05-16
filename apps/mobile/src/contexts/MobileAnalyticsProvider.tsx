import { Mixpanel } from 'mixpanel-react-native';
import { PropsWithChildren } from 'react';

import AnalyticsProvider, {
  IdentifyFunction,
  TrackFunction,
} from '~/shared/contexts/AnalyticsContext';

import { env } from '../../env/runtime';

let instance: Mixpanel | undefined = undefined;

const token = env.MIXPANEL_TOKEN;
const apiUrl = env.GRAPHQL_API_URL;

if (token && apiUrl) {
  instance = new Mixpanel(token, true);
  instance.init(false, {}, apiUrl);
}

const track: TrackFunction = (eventName, eventProps, userId) => {
  try {
    instance?.track(eventName, { userId, platform: 'mobile', ...eventProps });
  } catch (error: unknown) {
    // Handle error here
  }
};

const identify: IdentifyFunction = (userId) => {
  if (userId) {
    instance?.identify(userId);
  }
};

export function MobileAnalyticsProvider({ children }: PropsWithChildren) {
  return (
    <AnalyticsProvider track={track} identify={identify}>
      {children}
    </AnalyticsProvider>
  );
}
