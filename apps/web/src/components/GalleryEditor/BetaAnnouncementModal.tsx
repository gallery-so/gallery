import Image from 'next/image';
import cover from 'public/beta-tester-announcement.png';
import { useCallback } from 'react';
import { graphql } from 'react-relay';
import styled from 'styled-components';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { BetaAnnouncementModalMutation } from '~/generated/BetaAnnouncementModalMutation.graphql';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

import { Button } from '../core/Button/Button';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseXL, TitleL } from '../core/Text/Text';

// TODO: Replace with actual typeform URL
const TYPEFORM_URL = 'https://frameio.typeform.com/to/rgZ2Z4';

export function BetaAnnouncementModal() {
  const [optInForRoles] = usePromisifiedMutation<BetaAnnouncementModalMutation>(graphql`
    mutation BetaAnnouncementModalMutation($input: [Role!]!) @raw_response_type {
      optInForRoles(roles: $input) {
        __typename
        ... on OptInForRolesPayload {
          user {
            roles
          }
        }
        ... on ErrInvalidInput {
          __typename
          message
        }
      }
    }
  `);

  const { hideModal } = useModalActions();
  const reportError = useReportError();

  const handleContinue = useCallback(async () => {
    hideModal();

    try {
      await optInForRoles({
        variables: {
          input: ['BETA_TESTER'],
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        reportError(error);
      } else {
        reportError('Uncaught error in while opting in for beta tester');
      }
    }

    window.open(TYPEFORM_URL, '_blank');
  }, [hideModal, optInForRoles, reportError]);

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
