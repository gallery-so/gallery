import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { graphql, useFragment } from 'react-relay';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { useOpenSettingsModalFragment$key } from '~/generated/useOpenSettingsModalFragment.graphql';
import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';

import SettingsModal from './SettingsModal';

export default function useOpenSettingsModal(queryRef: useOpenSettingsModalFragment$key) {
  const query = useFragment(
    graphql`
      fragment useOpenSettingsModalFragment on Query {
        viewer {
          __typename
        }
        ...SettingsModalFragment
        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

  const router = useRouter();
  const { showModal } = useModalActions();
  const { settings } = router.query;
  const isEmailFeatureEnabled = isFeatureEnabled(FeatureFlag.EMAIL, query);

  const isLoggedIn = query.viewer?.__typename === 'Viewer';

  useEffect(() => {
    // Only show the modal if the user is logged in and the settings query param is set
    if (settings === 'true' && isLoggedIn && isEmailFeatureEnabled) {
      showModal({
        content: <SettingsModal queryRef={query} />,
        headerText: 'Settings',
      });
    }
  }, [isEmailFeatureEnabled, isLoggedIn, query, router, settings, showModal]);
}
