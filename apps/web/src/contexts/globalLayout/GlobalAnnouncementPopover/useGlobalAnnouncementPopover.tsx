import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { useGlobalAnnouncementPopoverFragment$key } from '~/generated/useGlobalAnnouncementPopoverFragment.graphql';
import { featurePostsPageContentQuery } from '~/pages/features/posts';
import { PostsFeaturePageContent } from '~/scenes/ContentPages/PostsFeaturePage';
import useExperience from '~/utils/graphql/experiences/useExperience';
import { fetchSanityContent } from '~/utils/sanity';

// Keeping for future use
// import GlobalAnnouncementPopover from './GlobalAnnouncementPopover';

type Props = {
  queryRef: useGlobalAnnouncementPopoverFragment$key;
  authRequired?: boolean;
  popoverDelayMs?: number;
  // `session` will make ensure the modal re-appears if the user refreshes the page.
  // this is used for a consistent experience on presentational profiles (e.g. 3AC gallery)
  // `global` will make sure the modal only appears once ever, unless the user clears
  // their localStorage
  dismissVariant?: 'session' | 'global';
};

export default function useGlobalAnnouncementPopover({
  queryRef,
  authRequired = false,
  popoverDelayMs = 0,
  dismissVariant = 'global',
}: Props) {
  const query = useFragment(
    graphql`
      fragment useGlobalAnnouncementPopoverFragment on Query {
        viewer {
          ... on Viewer {
            user {
              id
              username
            }
          }
        }
        # ...GlobalAnnouncementPopoverFragment
        ...useExperienceFragment
      }
    `,
    queryRef
  );

  const isAuthenticated = Boolean(query.viewer?.user?.id);

  const { asPath, query: urlQuery } = useRouter();

  // NOTE: next time we use global announcements, we'll need to set a new flag in the schema
  // const isGlobalAnnouncementExperienced = true;
  const [isGlobalAnnouncementExperienced, setGlobalAnnouncementExperienced] = useExperience({
    type: 'PostsBetaAnnouncement',
    queryRef: query,
  });
  const handleDismissGlobalAnnouncement = useCallback(async () => {
    return await setGlobalAnnouncementExperienced();
  }, [setGlobalAnnouncementExperienced]);

  // tracks dismissal on session, not persisted across refreshes
  const [dismissedOnSession, setDismissedOnSession] = useState(false);

  const { showModal, hideModal } = useModalActions();

  const shouldHidePopoverOnCurrentPath = useMemo(() => {
    // Ensure we don't show the modal if the user is just about to get redirected
    // I'm so sorry if you're reading this...
    if (isAuthenticated && asPath === '/') {
      return;
    }

    // hide on opengraph pages
    if (asPath.includes('opengraph')) return true;
    // hide on announcements page
    if (asPath === '/announcements') return true;
    // hide on auth page
    if (asPath === '/auth') return true;
    // hide on editor pages
    if (asPath.toLowerCase().includes('/edit')) return true;
    // hide for new users onboarding
    if (asPath.toLowerCase().includes('/onboarding')) return true;

    // hide for users who have explicitly requested the popover to be disabled on their page
    if (typeof urlQuery.username === 'string') {
      const disabledUserProfiles = ['curated', '1of1'];
      if (disabledUserProfiles.includes(urlQuery.username.toLowerCase())) return true;
    }

    return false;
  }, [asPath, urlQuery.username, isAuthenticated]);

  useEffect(() => {
    async function handleMount() {
      if (dismissVariant === 'session' && dismissedOnSession) return;
      if (dismissVariant === 'global' && isGlobalAnnouncementExperienced) return;

      if (authRequired && !isAuthenticated) return;

      if (shouldHidePopoverOnCurrentPath) return;

      // prevent font flicker on popover load
      // await handlePreloadFonts();

      const pageContent = await fetchSanityContent(featurePostsPageContentQuery);

      if (!pageContent || !pageContent[0]) return;

      setTimeout(() => {
        showModal({
          id: 'global-announcement-popover',
          content: <PostsFeaturePageContent pageContent={pageContent[0]} />,
          isFullPage: true,
          headerVariant: 'thicc',
        });
        setDismissedOnSession(true);
        handleDismissGlobalAnnouncement();
      }, popoverDelayMs);
    }

    handleMount();
  }, [
    isAuthenticated,
    showModal,
    query,
    asPath,
    isGlobalAnnouncementExperienced,
    authRequired,
    popoverDelayMs,
    dismissVariant,
    dismissedOnSession,
    shouldHidePopoverOnCurrentPath,
    handleDismissGlobalAnnouncement,
  ]);

  useEffect(
    function handleCloseModalOnRedirect() {
      if (shouldHidePopoverOnCurrentPath) {
        hideModal({
          id: 'global-announcement-popover',
        });
      }
    },
    [hideModal, shouldHidePopoverOnCurrentPath]
  );
}

// async function handlePreloadFonts() {
//   const fontLight = new FontFace(
//     'GT Alpina Condensed',
//     'url(/fonts/GT-Alpina-Condensed-Light.otf)'
//   );
//   const fontLightItalic = new FontFace(
//     'GT Alpina Condensed',
//     'url(/fonts/GT-Alpina-Condensed-Light-Italic.otf)'
//   );
//   const fontLight2 = new FontFace(
//     'GT Alpina Condensed',
//     'url(/fonts/GT-Alpina-Condensed-Light.ttf)'
//   );
//   const fontLightItalic2 = new FontFace(
//     'GT Alpina Condensed',
//     'url(/fonts/GT-Alpina-Condensed-Light-Italic.ttf)'
//   );

//   await fontLight.load();
//   await fontLightItalic.load();
//   await fontLight2.load();
//   await fontLightItalic2.load();
// }
