import AppleLogo from 'public/icons/apple_logo.svg';
import AppStoreBadge from 'public/icons/Download_on_the_App_Store_US.svg';
import { contexts, flows } from 'shared/analytics/constants';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseXL, TitleDiatypeL, TitleDiatypeM, TitleXS } from '~/components/core/Text/Text';
import useAuthModal from '~/hooks/useAuthModal';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import colors from '~/shared/theme/colors';

import { CmsTypes } from '../ContentPages/cms_types';
import FeaturedProfiles from '../ContentPages/ContentModules/FeaturedProfiles';
import FeatureHighlight from '../ContentPages/ContentModules/FeatureHighlight';
import Testimonials from '../ContentPages/ContentModules/Testimonials';
import LandingCoverAnimation from './LandingCoverAnimation';
import LandingPageNavbar from './LandingPageNavbar';

const MOBILE_PAGE_GUTTER = 32;
const DESKTOP_PAGE_GUTTER = 48;

type Props = {
  pageContent: CmsTypes.LandingPage;
};

export default function LandingPage({ pageContent }: Props) {
  const track = useTrack();

  const isMobile = useIsMobileOrMobileLargeWindowWidth();
  const showAuthModal = useAuthModal('sign-up');

  return (
    <StyledLandingPage gap={70}>
      <LandingPageNavbar />
      <LandingCoverAnimation />
      <StyledMainContent>
        <FullWidthWrapper gap={isMobile ? 70 : 120} justify="center" align="center">
          <PageGutterWrapper gap={isMobile ? 70 : 120}>
            {/* <FeatureHighlight content={pageContent.highlight1} /> */}
            <StyledFeatureHighlightContainer>
              {pageContent.miniFeatureHighlights.map(
                (featureHighlight: CmsTypes.FeatureHighlight) => (
                  <FeatureHighlight key={featureHighlight._type} content={featureHighlight} />
                )
              )}
            </StyledFeatureHighlightContainer>
            {/* <StyledMobileAppCta> */}
            {/* <StyledMobileAppImage
                src="https://storage.googleapis.com/gallery-prod-325303.appspot.com/landingPage/mobileapp.jpg"
                alt="Image of Mobile App"
              /> */}
            <StyledMobileAppCta gap={64} justify="center" align="center">
              <VStack gap={32} align="center" justify="center">
                <StyledTitleLarge>Available on web and iOS</StyledTitleLarge>
                <StyledText>The mobile app is very cool and you should download it.</StyledText>
              </VStack>

              {/* <StyledAppStoreBadgeLink href="https://apps.apple.com/app/gallery/id6447068892?l=en-US">
                <AppStoreBadge width="160" height="53.5" />
              </StyledAppStoreBadgeLink> */}
              <VStack gap={24} align="center">
                <HStack gap={12}>
                  <StyledCtaButton variant="secondary">
                    <StyledCtaText>Sign up on web</StyledCtaText>
                  </StyledCtaButton>
                  <StyledCtaButton>
                    <HStack gap={6} align="center">
                      <AppleLogo width={27} height={27} />
                      <StyledCtaText color={colors.white}>Download App</StyledCtaText>
                    </HStack>
                  </StyledCtaButton>
                </HStack>
                <BaseXL color={colors.metal}>Android coming soon</BaseXL>
              </VStack>
            </StyledMobileAppCta>
            {/* </StyledMobileAppCta> */}
          </PageGutterWrapper>
          <FullWidthWrapper gap={45}>
            <PageGutterWrapper gap={16}>
              <StyledTitle>The best collectors and creators are already on Gallery</StyledTitle>
              {/* <StyledSubTitle>A selection of Collectors, Creators and Galleries</StyledSubTitle> */}
            </PageGutterWrapper>
            <FeaturedProfiles profiles={pageContent.featuredProfiles} />
          </FullWidthWrapper>
          {/* <PageGutterWrapper gap={32}>
            <StyledTitle>What our users say</StyledTitle>
            <Testimonials testimonials={pageContent.testimonials} />
          </PageGutterWrapper> */}
          {/* <VStack gap={32}>
            <StyledSubTitle>Start your journey today</StyledSubTitle>
            <Button
              eventElementId="Landing Page Get Started"
              eventName="Clicked Landing Page Get Started"
              eventContext={contexts.Onboarding}
              eventFlow={flows['Web Signup Flow']}
              onClick={showAuthModal}
            >
              <StyledGetStartedButtonText>Get started</StyledGetStartedButtonText>
            </Button>
          </VStack> */}
        </FullWidthWrapper>
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
  margin-bottom: 250px;
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

  @media only screen and ${breakpoints.tablet} {
    // flex-direction: row;
    // gap: 0 16px;
  }
`;

const StyledMobileAppCta = styled(VStack)`
  width: 100%;
`;

const StyledCtaButton = styled(Button)`
  padding: 8px 24px;
  border: 1px solid ${colors.black['800']};

  @media only screen and ${breakpoints.tablet} {
    padding: 13px 39px;
  }
`;

const StyledCtaText = styled(TitleXS)`
  @media only screen and ${breakpoints.tablet} {
    font-size: 20px;
    line-height: 26px;
  }
`;

const StyledMobileAppImage = styled.img`
  width: 100%;
  height: 100%;

  @media only screen and ${breakpoints.tablet} {
    max-width: 500px;
    max-height: 500px;
  }
`;

const StyledAppStoreBadgeLink = styled(GalleryLink)`
  width: fit-content;
`;

const StyledLandingPage = styled(VStack)`
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 16px 0;
  margin-bottom: 64px;
`;

const StyledTitle = styled(TitleDiatypeL)`
  font-size: 40px;
  line-height: 56px;
  font-weight: 400;
  letter-spacing: -0.03em;
`;

const StyledTitleLarge = styled(StyledTitle)`
  font-size: 40px;
  line-height: 42px;
  text-align: center;

  @media only screen and ${breakpoints.desktop} {
    font-size: 56px;
    line-height: 56px;
  }
`;

const StyledSubTitle = styled(TitleDiatypeM)`
  font-size: 24px;
  line-height: 32px;
  font-weight: 400;
`;

const FullWidthWrapper = styled(VStack)`
  width: 100%;
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

const StyledGetStartedButtonText = styled(TitleDiatypeL)`
  color: ${colors.white};
  text-transform: none;
`;
