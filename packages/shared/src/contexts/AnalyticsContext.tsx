import { createContext, memo, ReactNode, useCallback, useContext, useEffect } from 'react';
import { useRelayEnvironment } from 'react-relay';
import { fetchQuery, graphql } from 'relay-runtime';

import { AnalyticsContextQuery } from '~/generated/AnalyticsContextQuery.graphql';

type EventProps = Record<string, unknown>;

export type GalleryElementTrackingProps = {
  // identifier for the element being acted upon.
  // this should be unique across the app.
  // e.g. `Feed Username Button`
  eventElementId: string | null;
  // name of the action. this can be duplicated.
  // e.g. `Follow User`
  eventName: string | null;
  // custom metadata.
  // e.g. { variant: 'Worldwide' }
  properties?: EventProps;
};

type HookTrackFunction = (eventName: string, eventProps?: EventProps, checkAuth?: boolean) => void;

const AnalyticsContext = createContext<HookTrackFunction | undefined>(undefined);

export const useTrack = () => {
  const track = useContext(AnalyticsContext);

  if (!track) {
    return () => {};
  }

  return track;
};

const AnalyticsContextQueryNode = graphql`
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

export type TrackFunction = (eventName: string, eventProps: EventProps) => void;
export type IdentifyFunction = (userId: string) => void;

type Props = {
  children: ReactNode;
  track: TrackFunction;
  identify: IdentifyFunction;
};

const AnalyticsProvider = memo(({ children, identify, track }: Props) => {
  const relayEnvironment = useRelayEnvironment();

  useEffect(() => {
    fetchQuery<AnalyticsContextQuery>(
      relayEnvironment,
      AnalyticsContextQueryNode,
      {},
      { fetchPolicy: 'store-or-network' }
    )
      .toPromise()
      .then((query) => {
        const userId = query?.viewer?.user?.dbid;

        // don't identify unauthenticated users
        if (!userId) {
          return;
        }

        identify(userId);
      });
  }, [identify, relayEnvironment]);

  const handleTrack: HookTrackFunction = useCallback(
    (eventName, eventProps = {}) => {
      track(eventName, eventProps);
    },
    [track]
  );

  return <AnalyticsContext.Provider value={handleTrack}>{children}</AnalyticsContext.Provider>;
});

AnalyticsProvider.displayName = 'AnalyticsProvider';

export default AnalyticsProvider;
