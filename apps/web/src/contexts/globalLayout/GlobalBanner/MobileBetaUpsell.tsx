import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';

import { GlobalBanner } from '~/components/core/GlobalBanner/GlobalBanner';
import { UserExperienceType } from '~/generated/enums';
import { MobileBetaUpsellFragment$key } from '~/generated/MobileBetaUpsellFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import useExperience from '~/utils/graphql/experiences/useExperience';
import isIOS from '~/utils/isIOS';

import MobileBetaReleaseBanner from './MobileBetaReleaseBanner';

type Props = {
  queryRef: MobileBetaUpsellFragment$key;
  experienceFlag: UserExperienceType;
  text: string;
  title?: string;
  requireAuth?: boolean;
  dismissOnActionComponentClick?: boolean;
};

export default function MobileBetaUpsell({
  queryRef,
  experienceFlag,
  text,
  title,
  requireAuth = false,
  dismissOnActionComponentClick = false,
}: Props) {
  const query = useFragment(
    graphql`
      fragment MobileBetaUpsellFragment on Query {
        viewer {
          ... on Viewer {
            user {
              id
            }
          }
        }

        ...useExperienceFragment
      }
    `,
    queryRef
  );

  const isAuthenticated = Boolean(query.viewer?.user?.id);
  const { push } = useRouter();

  const track = useTrack();

  const [isBannerExperienced, setBannerExperienced] = useExperience({
    type: experienceFlag,
    queryRef: query,
  });

  const hideBanner = useCallback(async () => {
    await setBannerExperienced();
  }, [setBannerExperienced]);

  const handleActionClick = useCallback(() => {
    // TODO: standardize this tracking across all buttons, chips, and icons, like mobile
    track('Button Click', {
      id: 'Banner Button',
      name: 'Global Banner Button Clicked',
      variant: 'default',
    });

    push('/mobile');

    if (dismissOnActionComponentClick) {
      hideBanner();
    }
  }, [dismissOnActionComponentClick, hideBanner, push, track]);

  const isMobile = useIsMobileWindowWidth();

  if (text.length === 0 || isBannerExperienced || (requireAuth && !isAuthenticated)) {
    return null;
  }

  // TEMPORARY BANNER FOR IOS BETA ANNOUNCEMENT
  if (isIOS() && isMobile) {
    return <MobileBetaReleaseBanner handleCTAClick={handleActionClick} />;
  }

  return (
    <GlobalBanner
      title={title}
      description={text}
      onClose={hideBanner}
      onClick={handleActionClick}
      ctaText="Download"
    />
  );
}
