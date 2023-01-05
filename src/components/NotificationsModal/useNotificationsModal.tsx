import { useCallback, useMemo } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import IconContainer from '~/components/core/Markdown/IconContainer';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { useNotificationsModalQuery } from '~/generated/useNotificationsModalQuery.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import CogIcon from '~/icons/CogIcon';
import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';

import SettingsModal from '../../scenes/Modals/SettingsModal/SettingsModal';
import { NotificationsModal } from './NotificationsModal';

export default function useNotificationsModal() {
  const query = useLazyLoadQuery<useNotificationsModalQuery>(
    graphql`
      query useNotificationsModalQuery {
        ...isFeatureEnabledFragment
        ...SettingsModalFragment
      }
    `,
    {}
  );

  const { showModal, hideModal } = useModalActions();
  const isEmailFeatureEnabled = isFeatureEnabled(FeatureFlag.EMAIL, query);
  const isMobile = useIsMobileWindowWidth();

  const notificationModalActions = useMemo(() => {
    const handleSettingsClick = () => {
      // Hide notification modal
      hideModal();

      showModal({
        content: <SettingsModal queryRef={query} />,
        headerText: 'Settings',
      });
    };

    return (
      <IconContainer
        variant="default"
        onClick={handleSettingsClick}
        icon={<CogIcon />}
      ></IconContainer>
    );
  }, [hideModal, showModal, query]);

  return useCallback(() => {
    showModal({
      content: <NotificationsModal fullscreen={isMobile} />,
      isFullPage: isMobile,
      isPaddingDisabled: true,
      headerVariant: 'standard',
      headerActions: isEmailFeatureEnabled ? notificationModalActions : false,
    });
  }, [isEmailFeatureEnabled, isMobile, notificationModalActions, showModal]);
}
