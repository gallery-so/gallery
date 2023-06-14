import Head from 'next/head';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseXL, TitleDiatypeL, TitleL } from '~/components/core/Text/Text';
import { useGlobalNavbarHeight } from '~/contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';

export default function MobileAppLandingPage() {
  const navbarHeight = useGlobalNavbarHeight();

  return (
    <>
      <Head>
        <title>Gallery | Mobile App</title>
      </Head>
      <StyledPage navbarHeight={navbarHeight} gap={32} align="center">
        <VStack align="center">
          <TitleDiatypeL>Introducing</TitleDiatypeL>
          <VStack align="center" gap={24}>
            <VStack align="center" gap={16}>
              <GiantTitle>A New Era of Gallery</GiantTitle>
              <BodyText gap={8}>
                <BaseXL>
                  We’re building a fresh approach to creativity and self expression, and that starts
                  with a mobile app.
                </BaseXL>
                <BaseXL>TestFlight access on iOS is now open to all Gallery users.</BaseXL>
                {/* <BaseXL>Join the waitlist to be the first to try it out.</BaseXL> */}
              </BodyText>
            </VStack>
            <VStack gap={8}>
              <StyledLink
                href="https://testflight.apple.com/join/rc0NcVih"
                target="_blank"
                rel="noreferrer"
              >
                <StyledButton>Download The App</StyledButton>
              </StyledLink>
            </VStack>
          </VStack>
        </VStack>
        <StyledImage src="https://storage.googleapis.com/gallery-prod-325303.appspot.com/mobile_app_mock_light.png" />
      </StyledPage>
    </>
  );
}

const StyledPage = styled(VStack)<{ navbarHeight: number }>`
  display: flex;
  flex-direction: column;
  max-width: 100vw;
  align-items: center;

  padding-top: ${({ navbarHeight }) => navbarHeight + 40}px;
  padding-bottom: 100px;
  margin: 0 16px;
  min-height: 100vh;
`;

const GiantTitle = styled(TitleL)`
  font-family: 'GT Alpina Condensed';
  line-height: 64px;
  font-size: 64px;
  text-align: center;

  @media only screen and ${breakpoints.desktop} {
    font-size: 88px;
    line-height: 88px;
  }
`;

const StyledLink = styled.a`
  text-decoration: none;
`;

const StyledButton = styled(Button)`
  width: 240px;
  height: 40px;
`;

const BodyText = styled(VStack)`
  align-items: baseline;

  @media only screen and ${breakpoints.tablet} {
    align-items: center;
    text-align: center;
  }
`;

const StyledImage = styled.img`
  width: 100%;

  @media only screen and ${breakpoints.tablet} {
    width: 420px;
  }
`;
