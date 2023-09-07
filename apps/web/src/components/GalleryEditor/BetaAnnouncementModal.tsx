import Image from 'next/image';
import cover from 'public/beta-tester-announcement.png';
import { useCallback } from 'react';
import styled from 'styled-components';

import { useModalActions } from '~/contexts/modal/ModalContext';

import { Button } from '../core/Button/Button';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseXL, TitleL } from '../core/Text/Text';

// TODO: Replace with actual typeform URL
const TYPEFORM_URL = 'https://frameio.typeform.com/to/rgZ2Z4';

export function BetaAnnouncementModal() {
  const { hideModal } = useModalActions();

  const handleContinue = useCallback(() => {
    hideModal();

    window.open(TYPEFORM_URL, '_blank');
  }, [hideModal]);

  return (
    <Container justify="space-between" align="center">
      <StyledImage src={cover} alt="frame" />

      <StyledTextContainer align="center" gap={64}>
        <VStack gap={32}>
          <StyledHeader>Exclusive beta access</StyledHeader>
          <BaseXL>
            Thank you for being an active user on Gallery. As a thank you, we’re granting you early
            beta access to our newest social feature — Posts!
          </BaseXL>
        </VStack>

        <Button onClick={handleContinue}>Continue</Button>
      </StyledTextContainer>
    </Container>
  );
}

const Container = styled(HStack)`
  width: 1024px;
  padding: 32px 16px 20px;
`;

const StyledImage = styled(Image)`
  width: 500px;
  height: auto;
`;

const StyledHeader = styled(TitleL)`
  font-size: 56px;
`;

const StyledTextContainer = styled(VStack)`
  padding: 0 48px;
  text-align: center;
`;
