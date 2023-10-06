import {
  createContext,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useRelayEnvironment } from 'react-relay';
import { fetchQuery, graphql } from 'relay-runtime';

import { AnalyticsContextQuery } from '~/generated/AnalyticsContextQuery.graphql';

import { AnalyticsEventContextType, AnalyticsEventFlowType } from '../analytics/constants';

type EventProps = Record<string, unknown>;

export type GalleryElementTrackingProps = {
  // identifier for the element being acted upon.
  // this should be unique across the app.
  // e.g. `Feed Username Button`
  eventElementId: string | null;
  // a generalized name of the action. this can be duplicated
  // across several elements, if several elements can trigger
  // the same event.
  // e.g. `Follow User`
  eventName: string | null;
  // a bucket, category, or general location for the event.
  // e.g. `Authentication`, `Web Editor`
  eventContext: AnalyticsEventContextType | null;
  // an explicit user flow that the event falls into
  // e.g. `Add Wallet Flow` or `Post Flow`
  eventFlow?: AnalyticsEventFlowType | null;
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
          roles
        }
      }
    }
  }
`;

export type TrackFunction = (eventName: string, eventProps: EventProps) => void;
export type IdentifyFunction = (userId: string) => void;
export type RegisterSuperPropertiesFunction = (eventProps: EventProps) => void;

type Props = {
  children: ReactNode;
  track: TrackFunction;
  identify: IdentifyFunction;
  registerSuperProperties: RegisterSuperPropertiesFunction;
};

const AnalyticsProvider = memo(({ children, identify, track, registerSuperProperties }: Props) => {
  const relayEnvironment = useRelayEnvironment();
  const [isBetaTester, setIsBetaTester] = useState<boolean>(false);

  useEffect(() => {
    fetchQuery<AnalyticsContextQuery>(
      relayEnvironment,
      AnalyticsContextQueryNode,
      {},
      { fetchPolicy: 'store-or-network' }
    )
      .toPromise()
      .then((query) => {
        const user = query?.viewer?.user;
        const userId = user?.dbid;

        // don't identify unauthenticated users
        if (!userId) {
          return;
        }
        identify(userId);

        if (user.roles?.includes('BETA_TESTER')) {
          setIsBetaTester(true);
          registerSuperProperties({ isBetaTester: true });
        }
      });
  }, [identify, registerSuperProperties, relayEnvironment]);

  const handleTrack: HookTrackFunction = useCallback(
    (eventName, eventProps = {}) => {
      track(eventName, { ...eventProps, isBetaTester });
    },
    [isBetaTester, track]
  );

  return <AnalyticsContext.Provider value={handleTrack}>{children}</AnalyticsContext.Provider>;
});

AnalyticsProvider.displayName = 'AnalyticsProvider';

export default AnalyticsProvider;
