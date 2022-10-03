import { useModalActions } from 'contexts/modal/ModalContext';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import GlobalAnnouncementPopover from './GlobalAnnouncementPopover';
import { useGlobalAnnouncementPopoverFragment$key } from '../../../../__generated__/useGlobalAnnouncementPopoverFragment.graphql';
import { TEZOS_ANNOUNCEMENT_STORAGE_KEY } from 'constants/storageKeys';
import usePersistedState from 'hooks/usePersistedState';

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
        ...GlobalAnnouncementPopoverFragment
      }
    `,
    queryRef
  );

  const isAuthenticated = Boolean(query.viewer?.user?.id);

  const { asPath } = useRouter();

  // tracks dismissal on localStorage, persisted across refreshes
  const [dismissedOnLocalStorage, setDismissedOnLocalStorage] = usePersistedState(
    TEZOS_ANNOUNCEMENT_STORAGE_KEY,
    false
  );

  // tracks dismissal on session, not persisted across refreshes
  const [dismissedOnSession, setDismissedOnSession] = useState(false);

  const { showModal, hideModal } = useModalActions();

  const shouldHidePopover = useMemo(() => {
    // hide modal on opengraph pages
    if (asPath.includes('opengraph')) return true;
    // hide announcement modal on announcements page
    if (asPath === '/announcements') return true;
    // hide on auth page
    if (asPath === '/auth') return true;
    // hide on edit page
    if (asPath === '/edit') return true;
    // hide for new users onboarding
    if (asPath === '/welcome' || query.viewer?.user?.username === '') return true;
    // hide for curated for now
    if (asPath.toLowerCase().includes('curated')) return true;

    return false;
  }, [asPath, query.viewer?.user?.username]);

  useEffect(() => {
    async function handleMount() {
      if (dismissVariant === 'session' && dismissedOnSession) return;
      if (dismissVariant === 'global' && dismissedOnLocalStorage) return;

      if (authRequired && !isAuthenticated) return;

      if (shouldHidePopover) return;

      // prevent font flicker on popover load
      await handlePreloadFonts();

      setTimeout(() => {
        showModal({
          id: 'global-announcement-popover',
          content: <GlobalAnnouncementPopover queryRef={query} />,
          isFullPage: true,
          headerVariant: 'thicc',
        });
        setDismissedOnLocalStorage(true);
        setDismissedOnSession(true);
      }, popoverDelayMs);
    }

    handleMount();
  }, [
    isAuthenticated,
    showModal,
    query,
    asPath,
    dismissedOnLocalStorage,
    setDismissedOnLocalStorage,
    authRequired,
    popoverDelayMs,
    dismissVariant,
    dismissedOnSession,
    shouldHidePopover,
  ]);

  useEffect(
    function handleCloseModalOnRedirect() {
      if (shouldHidePopover) {
        hideModal({
          id: 'global-announcement-popover',
        });
      }
    },
    [hideModal, shouldHidePopover]
  );
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
