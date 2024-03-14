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

type SanityMaintenanceResponse = {
  id: string;
  isActive: boolean;
  message: string;
  displayType: 'banner' | 'fullScreen';
};

export type MaintenanceContent = Pick<SanityMaintenanceResponse, 'id' | 'isActive' | 'message'>;

type MaintenanceStatusValue = {
  fetchMaintenanceModeStatus: () => void;
  maintenanceCheckLoadedOrError: boolean;
  upcomingMaintenanceNoticeContent: MaintenanceContent | null;
  currentlyActiveMaintenanceNoticeContent: MaintenanceContent | null;
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
  MaintenanceChecker?: ReactElement | null;
};

const MaintenanceStatusProvider = memo(
  ({ sanityProjectId, children, MaintenancePageComponent, MaintenanceChecker = null }: Props) => {
    if (!sanityProjectId) {
      throw new Error('MaintenanceStatusProvider initiated without a sanity project ID!');
    }

    const [sanityLoadedOrError, setSanityLoadedOrError] = useState(false);
    // this content will likely appear in a dismissable banner or bottomsheet
    const [upcomingMaintenanceNoticeContent, setUpcomingMaintenanceNoticeContent] =
      useState<MaintenanceStatusValue['upcomingMaintenanceNoticeContent']>(null);
    // this content will likely appear on a full-page screen takeover
    const [currentlyActiveMaintenanceNoticeContent, setCurrentlyActiveMaintenanceNoticeContent] =
      useState<MaintenanceStatusValue['currentlyActiveMaintenanceNoticeContent']>(null);

    const fetchMaintenanceModeFromSanity = useCallback(async () => {
      try {
        const response: SanityMaintenanceResponse[] = await Promise.race([
          fetchSanityContent(sanityProjectId)(
            '*[_type == "maintenanceManager"] { id, isActive, message, displayType }'
          ),
          new Promise(
            (_, reject) =>
              setTimeout(() => reject(new Error('Request timed out after 3 seconds')), 3000) // give Sanity 3 seconds max to respond so we don't block the app from loading if Sanity is down
          ),
        ]);

        if (!response[0]) {
          return;
        }

        const { id, isActive, message, displayType } = response[0];

        if (displayType === 'banner') {
          setUpcomingMaintenanceNoticeContent({
            id,
            isActive,
            message,
          });
        } else {
          setCurrentlyActiveMaintenanceNoticeContent({
            id,
            isActive,
            message,
          });
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
        upcomingMaintenanceNoticeContent,
        currentlyActiveMaintenanceNoticeContent,
      }),
      [
        currentlyActiveMaintenanceNoticeContent,
        fetchMaintenanceModeFromSanity,
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
          {MaintenanceChecker}
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
