import { FEED_ANNOUNCEMENT_STORAGE_KEY } from 'constants/storageKeys';
import { useModalActions } from 'contexts/modal/ModalContext';
import useIsFigure31ProfilePage from 'hooks/oneOffs/useIsFigure31ProfilePage';
import usePersistedState from 'hooks/usePersistedState';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import GlobalAnnouncementPopover from './GlobalAnnouncementPopover';

const AUTH_REQUIRED = false;
const GLOBAL_ANNOUNCEMENT_POPOVER_DELAY_MS = 0;

export default function useGlobalAnnouncementPopover(queryRef: any) {
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
      }
    `,
    queryRef
  );

  const isAuthenticated = Boolean(query.viewer?.user?.id);

  const { asPath } = useRouter();

  const [dismissed, setDismissed] = usePersistedState(FEED_ANNOUNCEMENT_STORAGE_KEY, false);

  // track dismissal separately from above in case we want the popover to be displayed
  // again when the user refreshes, but *not* when the user navigates between pages
  const [dismissedOnSession, setDismissedOnSession] = useState(false);

  const isFigure31ProfilePage = useIsFigure31ProfilePage();

  const { showModal } = useModalActions();

  useEffect(() => {
    async function handleMount() {
      if (dismissedOnSession) return;
      if (!isFigure31ProfilePage) return;

      if (dismissed) return;
      if (AUTH_REQUIRED && !isAuthenticated) return;
      // hide announcement modal on announcements page
      if (asPath === '/announcements') return;
      // hide for new users onboarding
      if (asPath === '/welcome' || query.viewer?.user?.username === '') return;
      // prevent font flicker on popover load
      await handlePreloadFonts();
      setTimeout(() => {
        showModal({
          content: <GlobalAnnouncementPopover />,
          isFullPage: true,
          headerVariant: 'thicc',
        });
        setDismissedOnSession(true);
      }, GLOBAL_ANNOUNCEMENT_POPOVER_DELAY_MS);
    }

    handleMount();
  }, [
    isAuthenticated,
    showModal,
    query,
    dismissed,
    setDismissed,
    asPath,
    isFigure31ProfilePage,
    dismissedOnSession,
  ]);
}

async function handlePreloadFonts() {
  const fontLight = new FontFace(
    'GT Alpina Condensed',
    'url(/fonts/GT-Alpina-Condensed-Light.otf)'
  );
  const fontLightItalic = new FontFace(
    'GT Alpina Condensed',
    'url(/fonts/GT-Alpina-Condensed-Light-Italic.otf)'
  );
  const fontLight2 = new FontFace(
    'GT Alpina Condensed',
    'url(/fonts/GT-Alpina-Condensed-Light.ttf)'
  );
  const fontLightItalic2 = new FontFace(
    'GT Alpina Condensed',
    'url(/fonts/GT-Alpina-Condensed-Light-Italic.ttf)'
  );

  await fontLight.load();
  await fontLightItalic.load();
  await fontLight2.load();
  await fontLightItalic2.load();
}
