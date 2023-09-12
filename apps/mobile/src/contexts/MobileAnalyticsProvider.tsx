import { Mixpanel } from 'mixpanel-react-native';
import { PropsWithChildren } from 'react';

import { env } from '~/env/runtime';
import AnalyticsProvider, {
  IdentifyFunction,
  RegisterSuperPropertiesFunction,
  TrackFunction,
} from '~/shared/contexts/AnalyticsContext';

let instance: Mixpanel | undefined = undefined;

const token = env.MIXPANEL_TOKEN;
const apiUrl = env.MIXPANEL_API_URL;

if (token && apiUrl) {
  instance = new Mixpanel(token, true);
  instance.init(false, {}, apiUrl);
}

const track: TrackFunction = (eventName, eventProps) => {
  try {
    instance?.track(eventName, eventProps);
  } catch (error: unknown) {
    // Handle error here
  }
};

const identify: IdentifyFunction = (userId) => {
  instance?.identify(userId);
};

const registerSuperProperties: RegisterSuperPropertiesFunction = (eventProps) => {
  instance?.registerSuperProperties(eventProps);
};

export function MobileAnalyticsProvider({ children }: PropsWithChildren) {
  return (
    <AnalyticsProvider
      track={track}
      identify={identify}
      registerSuperProperties={registerSuperProperties}
    >
      {children}
    </AnalyticsProvider>
  );
}
