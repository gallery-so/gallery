import { useCallback, useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GlobalBanner } from '~/components/core/GlobalBanner/GlobalBanner';
import { UpcomingMaintenanceBannerFragment$key } from '~/generated/UpcomingMaintenanceBannerFragment.graphql';
import usePersistedState from '~/hooks/usePersistedState';
import { useMaintenanceContext } from '~/shared/contexts/MaintenanceStatusContext';

export function useUpcomingMaintenanceBannerWeb() {
  const { maintenanceId, upcomingMaintenanceNoticeContent } = useMaintenanceContext();
  const [bannerDismissed, setBannerDismissed] = usePersistedState(maintenanceId, false);

  const shouldDisplayBanner = useMemo(() => {
    if (bannerDismissed) {
      return false;
    }

    if (upcomingMaintenanceNoticeContent?.isActive) {
      return true;
    }

    return false;
  }, [bannerDismissed, upcomingMaintenanceNoticeContent?.isActive]);

  const handleDismissBanner = useCallback(() => {
    setBannerDismissed(true);
  }, [setBannerDismissed]);

  return {
    shouldDisplayBanner,
    handleDismissBanner,
    maintenanceId,
    message: upcomingMaintenanceNoticeContent?.message ?? '',
  };
}

type Props = {
  queryRef: UpcomingMaintenanceBannerFragment$key;
  handleDismissBanner: () => void;
  maintenanceId: string;
  message: string;
};

export function UpcomingMaintenanceBanner({
  queryRef,
  handleDismissBanner,
  maintenanceId,
  message,
}: Props) {
  const query = useFragment(
    graphql`
      fragment UpcomingMaintenanceBannerFragment on Query {
        viewer {
          ... on Viewer {
            user {
              id
            }
          }
        }
      }
    `,
    queryRef
  );

  const isAuthenticated = Boolean(query.viewer?.user?.id);

  if (!isAuthenticated) {
    return null;
  }

  if (!message) {
    return null;
  }

  return (
    <GlobalBanner
      // @ts-expect-error: this will be set manually on sanity
      experienceFlag={maintenanceId}
      description={message}
      onClose={handleDismissBanner}
      bannerVariant="default"
    />
  );
}
