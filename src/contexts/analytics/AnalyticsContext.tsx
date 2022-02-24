import useAuthenticatedUserId from 'contexts/auth/useAuthenticatedUserId';
import mixpanel from 'mixpanel-browser';
import { createContext, memo, ReactNode, useCallback, useContext } from 'react';

type TrackFn = (eventName: string, eventProps?: Record<string, unknown>) => void;

const AnalyticsContext = createContext<TrackFn | undefined>(undefined);

export const useTrack = () => {
  const track = useContext(AnalyticsContext);
  if (!track) {
    throw new Error('Attempted to use AnalyticsContext without a provider!');
  }

  return track;
};

type Props = { children: ReactNode };

const mixpanelEnabled =
  process.env.NEXT_PUBLIC_MIXPANEL_TOKEN && process.env.NEXT_PUBLIC_ANALYTICS_API_URL;

const AnalyticsProvider = memo(({ children }: Props) => {
  const userId = useAuthenticatedUserId();

  const handleTrack: TrackFn = useCallback(
    (eventName, eventProps = {}) => {
      if (mixpanelEnabled) {
        // mixpanel errors shouldn't disrupt app
        try {
          mixpanel.track(eventName, {
            userId, // field will be `null` if no user ID exists
            ...eventProps,
          });
        } catch (error: unknown) {
          // TODO: send reporting errror to Sentry
          console.error(error);
        }
      }
    },
    [userId]
  );

  return <AnalyticsContext.Provider value={handleTrack}>{children}</AnalyticsContext.Provider>;
});

export default AnalyticsProvider;
