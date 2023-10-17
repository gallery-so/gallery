import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import IconContainer from '~/components/core/IconContainer';
import Settings from '~/components/Settings/Settings';
import { useDrawerActions } from '~/contexts/globalLayout/GlobalSidebar/SidebarDrawerContext';
import { NotificationEmailAlertQueryFragment$key } from '~/generated/NotificationEmailAlertQueryFragment.graphql';
import CloseIcon from '~/icons/CloseIcon';
import InfoCircleIcon from '~/icons/InfoCircleIcon';
import colors from '~/shared/theme/colors';

import GalleryLink from '../core/GalleryLink/GalleryLink';
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
        ...SettingsFragment
      }
    `,
    queryRef
  );

  const { showDrawer } = useDrawerActions();

  const handleEnableEmails = useCallback(() => {
    showDrawer({
      content: <Settings queryRef={query} />,
    });
  }, [query, showDrawer]);

  const handleDismiss = () => {
    onDismiss();
  };

  return (
    <StyledAlertContainer>
      <StyledAlert align="center" gap={8}>
        <StyledInfoCircleIcon />
        <BaseM>Never miss a moment! Enable email notifications in settings.</BaseM>
        <HStack align="center" gap={8}>
          <GalleryLink onClick={handleEnableEmails}>Enable</GalleryLink>
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
