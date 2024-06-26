import AppleLogo from 'public/icons/apple_logo.svg';
import { useCallback } from 'react';
import { contexts, flows } from 'shared/analytics/constants';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseXL, TitleDiatypeL, TitleXS } from '~/components/core/Text/Text';
import { useModalActions } from '~/contexts/modal/ModalContext';
import useUniversalAuthModal from '~/hooks/useUniversalAuthModal';
import {
  useIsDesktopWindowWidth,
  useIsMobileOrMobileLargeWindowWidth,
} from '~/hooks/useWindowSize';
import colors from '~/shared/theme/colors';

import { CmsTypes } from '../ContentPages/cms_types';
import FeaturedProfiles from '../ContentPages/ContentModules/FeaturedProfiles';
import FeatureHighlight from '../ContentPages/ContentModules/FeatureHighlight';
import DownloadAppQrModal from './DownloadAppQrModal';
import LandingCoverAnimation from './LandingCoverAnimation';
import LandingPageNavbar from './LandingPageNavbar';

const MOBILE_PAGE_GUTTER = 32;
const DESKTOP_PAGE_GUTTER = 48;
export const APP_STORE_URL = 'https://apps.apple.com/app/gallery/id6447068892?l=en-US';

type Props = {
  pageContent: CmsTypes.LandingPage;
};

export default function LandingPage({ pageContent }: Props) {
  const isMobile = useIsMobileOrMobileLargeWindowWidth();
  const isDesktop = useIsDesktopWindowWidth();
  const showAuthModal = useUniversalAuthModal();
  const { showModal } = useModalActions();

  const handleDownloadAppClick = useCallback(() => {
    if (isMobile) {
      window.open(APP_STORE_URL, '_blank');
      return;
    }

    showModal({
      content: <DownloadAppQrModal />,
    });
  }, [isMobile, showModal]);

  return (
    <StyledLandingPage gap={70}>
      <LandingPageNavbar />
      <LandingCoverAnimation />
      <StyledMainContent gap={isMobile ? 70 : 120} justify="center" align="center">
        <FullWidthVStack>
          <PageGutterWrapper gap={isMobile ? 70 : 120}>
            <StyledFeatureHighlightContainer>
              {pageContent.miniFeatureHighlights.map(
                (featureHighlight: CmsTypes.FeatureHighlight) => (
                  <FeatureHighlight key={featureHighlight._type} content={featureHighlight} />
                )
              )}
            </StyledFeatureHighlightContainer>
          </PageGutterWrapper>
        </FullWidthVStack>
        <FullWidthVStack gap={45}>
          <PageGutterWrapper gap={16}>
            <StyledTitle>The best collectors and creators are already on Gallery</StyledTitle>
          </PageGutterWrapper>
          <FeaturedProfiles profiles={pageContent.featuredProfiles} />
        </FullWidthVStack>
        {/* <PageGutterWrapper gap={32}>
            <StyledTitle>What our users say</StyledTitle>
            <Testimonials testimonials={pageContent.testimonials} />
          </PageGutterWrapper> */}
        <FullWidthVStack justify="center" align="center">
          <PageGutterWrapper gap={isDesktop ? 64 : 32}>
            <VStack gap={32} align="center" justify="center">
              <StyledMobileAppTitle>Available on web and iOS</StyledMobileAppTitle>
              <StyledText>Now you can share, discover and connect wherever you are.</StyledText>
            </VStack>
            <VStack gap={24} align="center">
              <StyledMobileButtonContainer gap={12}>
                <StyledCtaWrapper>
                  <StyledCtaButton
                    variant="secondary"
                    onClick={showAuthModal}
                    eventElementId="Landing Page Sign Up On Web Button"
                    eventName="Clicked Landing Page Sign Up On Web Button"
                    eventContext={contexts.Onboarding}
                    eventFlow={flows['Web Signup Flow']}
                  >
                    <StyledCtaText>Sign up on web</StyledCtaText>
                  </StyledCtaButton>
                </StyledCtaWrapper>
                <StyledCtaWrapper>
                  <StyledCtaButton
                    variant="primary"
                    eventElementId="Landing Page Download iOS App Button"
                    eventName="Clicked Landing Page Download iOS App Button"
                    eventContext={contexts.Onboarding}
                    eventFlow={flows['Web Signup Flow']}
                    onClick={handleDownloadAppClick}
                  >
                    <HStack gap={6} align="center">
                      <AppleLogo width={27} height={27} />
                      <StyledCtaText color={colors.white}>Download App</StyledCtaText>
                    </HStack>
                  </StyledCtaButton>
                </StyledCtaWrapper>
              </StyledMobileButtonContainer>
              <BaseXL color={colors.metal}>Android coming soon</BaseXL>
            </VStack>
          </PageGutterWrapper>
        </FullWidthVStack>
      </StyledMainContent>
    </StyledLandingPage>
  );
}

const StyledMainContent = styled(VStack)`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 1436px;
  margin-bottom: 120px;
`;

const PageGutterWrapper = styled(VStack)`
  padding: 0 ${MOBILE_PAGE_GUTTER}px;
  width: 100%;

  @media only screen and ${breakpoints.desktop} {
    padding: 0 ${DESKTOP_PAGE_GUTTER}px;
  }
`;

const StyledFeatureHighlightContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 56px 0;
`;

const FullWidthVStack = styled(VStack)`
  width: 100%;
`;

const StyledCtaWrapper = styled.div`
  width: 50%;

  @media only screen and ${breakpoints.tablet} {
    width: fit-content;
  }
`;

const StyledCtaButton = styled(Button)<{ variant: string }>`
  width: 100%;
  height: 100%;
  padding: 4px 12px;
  border: 1px solid ${colors.black['800']};

  @media only screen and ${breakpoints.tablet} {
    width: initial;
    padding: 13px 39px;
  }

  &:hover {
    opacity: 0.75;

    ${({ variant }) =>
      variant === 'secondary' &&
      `border-color: ${colors.faint}`} !important; // override Button component's hover state. making exception for Landing page
  }
`;

const StyledCtaText = styled(TitleXS)`
  @media only screen and ${breakpoints.tablet} {
    font-size: 20px;
    line-height: 26px;
  }
`;

const StyledMobileButtonContainer = styled(HStack)`
  width: 100%;
  justify-content: center;
`;

const StyledLandingPage = styled(VStack)`
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-bottom: 140px;

  @media only screen and ${breakpoints.tablet} {
    margin-bottom: 240px;
  }
`;

const StyledTitle = styled(TitleDiatypeL)`
  font-size: 32px;
  line-height: 38px;
  font-weight: 400;
  letter-spacing: -0.03em;

  @media only screen and ${breakpoints.desktop} {
    font-size: 48px;
    line-height: 48px;
  }
`;

const StyledMobileAppTitle = styled(StyledTitle)`
  font-size: 40px;
  line-height: 42px;
  text-align: center;
  max-width: 300px;

  @media only screen and ${breakpoints.tablet} {
    max-width: 100%;
    font-size: 32px;
    line-height: 38px;
  }

  @media only screen and ${breakpoints.desktop} {
    font-size: 56px;
    line-height: 56px;
  }
`;

const StyledText = styled(TitleDiatypeL)`
  font-weight: 400;
  font-size: 16px;
  line-height: 20px;
  letter-spacing: -0.03em;
  text-align: center;
  @media only screen and ${breakpoints.desktop} {
    font-size: 24px;
    line-height: 32px;
  }
`;
