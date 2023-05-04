import { Mixpanel } from 'mixpanel-react-native';
import { PropsWithChildren } from 'react';

import AnalyticsProvider, {
  IdentifyFunction,
  TrackFunction,
} from '~/shared/contexts/AnalyticsContext';

let instance: Mixpanel | undefined = undefined;

// TODO env
const token = '39358d4e4b8aeb0ee10e4ddbcb7a53eb';
const apiUrl = 'https://analytics.gallery.so';

if (token && apiUrl) {
  instance = new Mixpanel(token, true);
  instance.init(false, {}, apiUrl);
}

const track: TrackFunction = (eventName, eventProps, userId) => {
  try {
    instance?.track(eventName, { userId, ...eventProps });
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
