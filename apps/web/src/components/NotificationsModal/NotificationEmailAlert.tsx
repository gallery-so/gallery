import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import IconContainer from '~/components/core/IconContainer';
import { useDrawerActions } from '~/contexts/globalLayout/GlobalSidebar/SidebarDrawerContext';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { NotificationEmailAlertQueryFragment$key } from '~/generated/NotificationEmailAlertQueryFragment.graphql';
import CloseIcon from '~/icons/CloseIcon';
import InfoCircleIcon from '~/icons/InfoCircleIcon';
import SettingsModal from '~/scenes/Modals/SettingsModal/SettingsModal';

import colors from '../core/colors';
import InteractiveLink from '../core/InteractiveLink/InteractiveLink';
import { HStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';

type Props = {
  queryRef: NotificationEmailAlertQueryFragment$key;
  onDismiss: () => void;
};

export function NotificationEmailAlert({ onDismiss, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment NotificationEmailAlertQueryFragment on Query {
        ...SettingsModalFragment
      }
    `,
    queryRef
  );

  const { hideModal } = useModalActions();
  const { showDrawer } = useDrawerActions();

  const handleEnableEmails = useCallback(() => {
    // Hide notification modal
    hideModal();

    showDrawer({
      content: <SettingsModal queryRef={query} />,
      headerText: 'Settings',
      drawerName: 'settings',
    });
  }, [hideModal, query, showDrawer]);

  const handleDismiss = () => {
    onDismiss();
  };

  return (
    <StyledAlertContainer>
      <StyledAlert align="center" gap={8}>
        <StyledInfoCircleIcon />
        <BaseM>Never miss a moment! Enable email notifications in settings.</BaseM>
        <HStack align="center" gap={8}>
          <InteractiveLink onClick={handleEnableEmails}>Enable</InteractiveLink>
          <IconContainer variant="default" size="sm" onClick={handleDismiss} icon={<CloseIcon />} />
        </HStack>
      </StyledAlert>
    </StyledAlertContainer>
  );
}

const StyledAlertContainer = styled(HStack)`
  padding: 4px 12px;
`;

const StyledAlert = styled(HStack)`
  border: 1px solid ${colors.activeBlue};
  padding: 8px 12px;
`;

const StyledInfoCircleIcon = styled(InfoCircleIcon)`
  height: 24px;
  width: 24px;
  color: red;
`;
