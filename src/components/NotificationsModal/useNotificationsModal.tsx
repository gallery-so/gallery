import { useCallback, useMemo } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { useNotificationsModalQuery } from '~/generated/useNotificationsModalQuery.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import CogIcon from '~/icons/CogIcon';
import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';

import colors from '../core/colors';
import SettingsModal from '../Email/SettingsModal';
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
      <StyledCogButton onClick={handleSettingsClick}>
        <CogIcon />
      </StyledCogButton>
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

const StyledCogButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  margin: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  :hover {
    background-color: ${colors.faint};
  }
`;
