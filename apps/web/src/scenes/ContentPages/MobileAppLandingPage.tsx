import Head from 'next/head';
import { useCallback, useState } from 'react';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { SlimInput } from '~/components/core/Input/Input';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseXL, TitleDiatypeL, TitleL } from '~/components/core/Text/Text';
import { useGlobalNavbarHeight } from '~/contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';

export default function MobileAppLandingPage() {
  const navbarHeight = useGlobalNavbarHeight();
  const [email, setEmail] = useState('');
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target?.value);
  }, []);
  const handleSubmitClick = useCallback(() => {
    console.log('submit', email);
  }, [email]);

  return (
    <>
      <Head>
        <title>Gallery | Mobile App</title>
      </Head>
      <StyledPage navbarHeight={navbarHeight} gap={32}>
        <TitleDiatypeL>Introducing</TitleDiatypeL>
        <VStack align="center" gap={24}>
          <VStack align="center" gap={16}>
            <GiantTitle>The Gallery App</GiantTitle>
            <VStack align="center" gap={8}>
              <BaseXL>Opening TestFlight access soon to current Gallery users.</BaseXL>
              <BaseXL>Join the waitlist to be the first to try it out.</BaseXL>
            </VStack>
          </VStack>
          <VStack gap={8}>
            <StyledSlimInput
              placeholder="Enter your email address"
              onChange={handleInputChange}
              defaultValue={email}
            />
            <StyledButton onClick={handleSubmitClick}>Join the waitlist</StyledButton>
          </VStack>
        </VStack>
      </StyledPage>
    </>
  );
}

const StyledPage = styled(VStack)<{ navbarHeight: number }>`
  display: flex;
  flex-direction: column;
  max-width: 100vw;
  align-items: center;

  padding-top: ${({ navbarHeight }) => navbarHeight}px;
  min-height: 100vh;
`;

const GiantTitle = styled(TitleL)`
  font-family: 'GT Alpina Condensed';
  font-size: 88px;
  line-height: 88px;
`;

const StyledSlimInput = styled(SlimInput)`
  width: 240px;
`;

const StyledButton = styled(Button)`
  width: 240px;
`;
