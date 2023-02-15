import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { graphql, useFragment } from 'react-relay';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { useOpenSettingsModalFragment$key } from '~/generated/useOpenSettingsModalFragment.graphql';
import useAuthModal from '~/hooks/useAuthModal';

import SettingsModal from './SettingsModal/SettingsModal';

export default function useOpenSettingsModal(queryRef: useOpenSettingsModalFragment$key) {
  const query = useFragment(
    graphql`
      fragment useOpenSettingsModalFragment on Query {
        viewer {
          __typename
        }
        ...SettingsModalFragment
      }
    `,
    queryRef
  );

  const router = useRouter();
  const { showModal } = useModalActions();
  const showAuthModal = useAuthModal('signIn');
  const { settings } = router.query;

  const isLoggedIn = query.viewer?.__typename === 'Viewer';

  // feels like a hack but if this hook is run multiple times via parent component re-render,
  // the same modal is opened multiple times
  const isSettingsModalOpen = useRef(false);
  const isAuthModalOpen = useRef(false);

  useEffect(() => {
    // Only show the modal if the user is logged in and the settings query param is set
    if (settings === 'true' && !isSettingsModalOpen.current) {
      if (isLoggedIn) {
        isSettingsModalOpen.current = true;
        showModal({
          content: <SettingsModal queryRef={query} />,
          headerText: 'Settings',
        });
        return;
      }
      // if the user is not logged in, prompt them to log in, and the settings modal will open afterwards
      if (!isAuthModalOpen.current) {
        isAuthModalOpen.current = true;
        showAuthModal();
      }
    }
  }, [isLoggedIn, query, router, settings, showAuthModal, showModal]);
}
