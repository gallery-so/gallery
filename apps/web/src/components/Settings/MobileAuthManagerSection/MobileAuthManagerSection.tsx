import { useCallback } from 'react';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeL } from '~/components/core/Text/Text';
import { useModalActions } from '~/contexts/modal/ModalContext';

import SettingsRowDescription from '../SettingsRowDescription';

function MobileAuthBody() {
  return (
    <StyledBody>
      <BaseM>
        Scan the QR code to sign in to your Gallery mobile app. This code grants access to your
        account, so be careful who you share it with.
      </BaseM>
    </StyledBody>
  );
}

const StyledBody = styled(VStack)`
  max-width: 400px;
`;

export default function MobileAuthManagerSection() {
  const { showModal } = useModalActions();

  const handleDisplayMobileAuthModal = useCallback(() => {
    showModal({
      headerText: 'Pair with Mobile',
      content: <MobileAuthBody />,
    });
  }, [showModal]);

  return (
    <VStack gap={16}>
      <VStack>
        <TitleDiatypeL>Pair with Mobile</TitleDiatypeL>
        <SettingsRowDescription>
          Use a QR Code to sign in to the Gallery mobile app.
        </SettingsRowDescription>
      </VStack>
      <VStack justify="center" align="start" gap={8}>
        <Button onClick={handleDisplayMobileAuthModal}>View QR Code</Button>
        <InteractiveLink to={{ pathname: '/mobile' }}>Learn more about the app</InteractiveLink>
      </VStack>
    </VStack>
  );
}
