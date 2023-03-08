import { captureException } from '@sentry/nextjs';
import mixpanel from 'mixpanel-browser';
import { createContext, memo, ReactNode, useCallback, useContext } from 'react';
import { useRelayEnvironment } from 'react-relay';
import { fetchQuery, graphql } from 'relay-runtime';

import { AnalyticsContextQuery } from '~/generated/AnalyticsContextQuery.graphql';
import noop from '~/utils/noop';

type EventProps = Record<string, unknown>;

type TrackFn = (eventName: string, eventProps?: EventProps, checkAuth?: boolean) => void;

const AnalyticsContext = createContext<TrackFn | undefined>(undefined);

let mixpanelEnabled = true;

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
    captureException(error);
  }
};

export const _identify = (userId: string) => {
  if (!mixpanelEnabled) return;

  try {
    mixpanel.identify(userId);
  } catch (error: unknown) {
    // mixpanel errors shouldn't disrupt app
    captureException(error);
  }
};

export const useTrack = () => {
  const track = useContext(AnalyticsContext);
  if (!track) {
    return noop;
  }

  return track;
};

type Props = { children: ReactNode };

const AnalayticsContextQueryNode = graphql`
  query AnalyticsContextQuery {
    viewer {
      ... on Viewer {
        user {
          dbid
        }
      }
    }
  }
`;

const AnalyticsProvider = memo(({ children }: Props) => {
  const relayEnvironment = useRelayEnvironment();

  const handleTrack: TrackFn = useCallback(
    (eventName, eventProps = {}) => {
      fetchQuery<AnalyticsContextQuery>(
        relayEnvironment,
        AnalayticsContextQueryNode,
        {},
        { fetchPolicy: 'store-or-network' }
      )
        .toPromise()
        .then((query) => {
          const userId = query?.viewer?.user?.dbid;

          // don't track unauthenticated users
          if (!userId) {
            return;
          }

          _track(eventName, eventProps, userId);
        });
    },
    [relayEnvironment]
  );

  return <AnalyticsContext.Provider value={handleTrack}>{children}</AnalyticsContext.Provider>;
});

AnalyticsProvider.displayName = 'AnalyticsProvider';

export default AnalyticsProvider;
