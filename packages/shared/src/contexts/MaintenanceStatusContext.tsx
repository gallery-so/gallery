import React, {
  createContext,
  memo,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export const fetchSanityContent =
  (sanityProjectId: string | undefined) => async (query: string) => {
    const encodedQuery = encodeURIComponent(query);
    if (!sanityProjectId) {
      throw new Error('Missing CMS project id');
    }
    const url = `https://${sanityProjectId}.api.sanity.io/v1/data/query/production?query=${encodedQuery}`;
    const response = await fetch(url).then((res) => res.json());

    return response.result;
  };

type SanityMaintenanceModeResponse = {
  isActive: boolean;
  message: string;
};

type MaintenanceStatusValue = {
  fetchMaintenanceModeStatus: () => void;
  maintenanceCheckLoadedOrError: boolean;
  maintenanceId: string;
  upcomingMaintenanceNoticeContent: SanityMaintenanceModeResponse | null;
  currentlyActiveMaintenanceNoticeContent: SanityMaintenanceModeResponse | null;
};

const MaintenanceStatusContext = createContext<MaintenanceStatusValue | undefined>(undefined);

export const useMaintenanceContext = (): MaintenanceStatusValue => {
  const context = useContext(MaintenanceStatusContext);
  if (!context) {
    throw new Error('Attempted to use MaintenanceStatusContext without a provider!');
  }
  return context;
};

type Props = {
  children: ReactNode;
  sanityProjectId?: string;
  MaintenancePageComponent: ReactElement;
};

const MaintenanceStatusProvider = memo(
  ({ sanityProjectId, children, MaintenancePageComponent }: Props) => {
    if (!sanityProjectId) {
      if (process.env.NODE_ENV === 'test') {
        sanityProjectId = 'TEST_SANITY_PROJECT_ID';
      } else {
        throw new Error('MaintenanceStatusProvider initiated without a sanity project ID!');
      }
    }

    const [sanityLoadedOrError, setSanityLoadedOrError] = useState(false);
    // feature flag for maintenance
    const [maintenanceId, setMaintenanceId] = useState('');
    // this content will likely appear in a dismissable banner
    const [upcomingMaintenanceNoticeContent, setUpcomingMaintenanceNoticeContent] =
      useState<MaintenanceStatusValue['upcomingMaintenanceNoticeContent']>(null);
    // this content will likely appear on a full-page screen takeover
    const [currentlyActiveMaintenanceNoticeContent, setCurrentlyActiveMaintenanceNoticeContent] =
      useState<MaintenanceStatusValue['currentlyActiveMaintenanceNoticeContent']>(null);

    const fetchMaintenanceModeFromSanity = useCallback(async () => {
      try {
        const response = await Promise.race([
          fetchSanityContent(sanityProjectId)(
            '*[_type == "maintenanceMode"] { isActive, message }'
          ),
          new Promise(
            (_, reject) =>
              setTimeout(() => reject(new Error('Request timed out after 3 seconds')), 3000) // give Sanity 3 seconds max to respond so we don't block the app from loading if Sanity is down
          ),
        ]);

        setCurrentlyActiveMaintenanceNoticeContent(response?.[0]);
        if (typeof response?.[1]?.message === 'string') {
          const [maintenanceId, message] = response[1].message.split('%%%%%');
          setMaintenanceId(maintenanceId);
          response[1].message = message;
          setUpcomingMaintenanceNoticeContent(response[1]);
        }
      } finally {
        // the app is ready to be shown in these 3 cases: Sanity responded with a valid response, Sanity responded with an error, or Sanity timed out
        setSanityLoadedOrError(true);
      }
    }, [sanityProjectId]);

    useEffect(() => {
      fetchMaintenanceModeFromSanity();
    }, [fetchMaintenanceModeFromSanity]);

    const value = useMemo(
      () => ({
        fetchMaintenanceModeStatus: fetchMaintenanceModeFromSanity,
        maintenanceCheckLoadedOrError: sanityLoadedOrError,
        maintenanceId,
        upcomingMaintenanceNoticeContent,
        currentlyActiveMaintenanceNoticeContent,
      }),
      [
        currentlyActiveMaintenanceNoticeContent,
        fetchMaintenanceModeFromSanity,
        maintenanceId,
        sanityLoadedOrError,
        upcomingMaintenanceNoticeContent,
      ]
    );

    return (
      <MaintenanceStatusContext.Provider value={value}>
        <MaintenancePageOrChildren
          maintenanceIsActive={Boolean(currentlyActiveMaintenanceNoticeContent?.isActive)}
          MaintenancePageComponent={MaintenancePageComponent}
        >
          {children}
        </MaintenancePageOrChildren>
      </MaintenanceStatusContext.Provider>
    );
  }
);

function MaintenancePageOrChildren({
  children,
  maintenanceIsActive,
  MaintenancePageComponent,
}: PropsWithChildren<{ maintenanceIsActive: boolean; MaintenancePageComponent: ReactElement }>) {
  if (maintenanceIsActive) {
    return MaintenancePageComponent;
  }
  return <>{children}</>;
}

MaintenanceStatusProvider.displayName = 'MaintenanceStatusProvider';

export default MaintenanceStatusProvider;
