import useAuthenticatedUserId from 'contexts/auth/useAuthenticatedUserId';
import mixpanel from 'mixpanel-browser';
import { createContext, memo, ReactNode, useCallback, useContext } from 'react';

type EventProps = Record<string, unknown>;

type TrackFn = (eventName: string, eventProps?: EventProps) => void;

const AnalyticsContext = createContext<TrackFn | undefined>(undefined);

let mixpanelEnabled = false;

if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN && process.env.NEXT_PUBLIC_ANALYTICS_API_URL) {
  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
    api_host: process.env.NEXT_PUBLIC_ANALYTICS_API_URL,
  });
  mixpanelEnabled = true;
}

// raw tracking. use this sparingly if you can't use hooks, or are outside the analytics context.
export const _track = (eventName: string, eventProps: EventProps, userId?: string) => {
  if (!mixpanelEnabled) return;

  try {
    mixpanel.track(eventName, {
      userId, // field will be `null` if no user ID exists
      ...eventProps,
    });
  } catch (error: unknown) {
    // mixpanel errors shouldn't disrupt app
    // TODO: send reporting errror to Sentry
    console.error(error);
  }
};

export const useTrack = () => {
  const track = useContext(AnalyticsContext);
  if (!track) {
    throw new Error('Attempted to use AnalyticsContext without a provider!');
  }

  return track;
};

type Props = { children: ReactNode };

const AnalyticsProvider = memo(({ children }: Props) => {
  const userId = useAuthenticatedUserId();

  const handleTrack: TrackFn = useCallback(
    (eventName, eventProps = {}) => {
      _track(eventName, eventProps, userId);
    },
    [userId]
  );

  return <AnalyticsContext.Provider value={handleTrack}>{children}</AnalyticsContext.Provider>;
});

export default AnalyticsProvider;
