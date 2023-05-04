import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeL } from '~/components/core/Text/Text';
import QRCode from '~/components/QRCode/QRCode';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';

import SettingsRowDescription from '../SettingsRowDescription';
import useGenerateMobileOTPToken from './useGenerateMobileOTPToken';

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

function MobileAuthBody() {
  const [token, setToken] = useState('');
  const generateToken = useGenerateMobileOTPToken();
  const reportError = useReportError();

  useEffect(() => {
    async function getToken() {
      try {
        setToken(await generateToken());
      } catch (error) {
        if (error instanceof Error) {
          reportError(error);
        } else {
          reportError('Something unexpected went wrong');
        }
      }
    }

    getToken();
  }, [generateToken, reportError]);

  return (
    <StyledBody>
      <BaseM>
        Scan the QR code to sign in to your Gallery mobile app. This code grants access to your
        account, so be careful who you share it with.
      </BaseM>
      <StyledHStack justify="center">
        {token && <QRCode width={250} height={250} encodedData={token} />}
      </StyledHStack>
    </StyledBody>
  );
}

const StyledBody = styled(VStack)`
  max-width: 350px;
`;

const StyledHStack = styled(HStack)`
  padding: 20px;
`;
