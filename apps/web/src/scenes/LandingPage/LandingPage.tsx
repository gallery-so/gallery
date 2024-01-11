import AppStoreBadge from 'public/icons/Download_on_the_App_Store_US.svg';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import { VStack } from '~/components/core/Spacer/Stack';
import { TitleDiatypeL, TitleDiatypeM, TitleM } from '~/components/core/Text/Text';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import LogoBracketLeft from '~/icons/LogoBracketLeft';
import LogoBracketRight from '~/icons/LogoBracketRight';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import colors from '~/shared/theme/colors';

import { CmsTypes } from '../ContentPages/cms_types';
import FeaturedProfiles from '../ContentPages/ContentModules/FeaturedProfiles';
import FeatureHighlight from '../ContentPages/ContentModules/FeatureHighlight';
import Testimonials from '../ContentPages/ContentModules/Testimonials';
import LandingCoverAnimation from './LandingCoverAnimation';
import LandingPageNavbar from './LandingPageNavbar';

const MOBILE_PAGE_GUTTER = 32;
const DESKTOP_PAGE_GUTTER = 60;

type Props = {
  pageContent: CmsTypes.LandingPage;
};

export default function LandingPage({ pageContent }: Props) {
  const track = useTrack();

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  return (
    <StyledLandingPage>
      <LandingPageNavbar />
      <FullWidthWrapper gap={isMobile ? 70 : 130} justify="center" align="center">
        <LandingCoverAnimation />
        <PageGutterWrapper gap={isMobile ? 70 : 120}>
          <FeatureHighlight content={pageContent.highlight1} />
          <StyledFeatureHighlightContainer>
            {pageContent.miniFeatureHighlights.map(
              (featureHighlight: CmsTypes.FeatureHighlight) => (
                <FeatureHighlight key={featureHighlight._type} content={featureHighlight} />
              )
            )}
          </StyledFeatureHighlightContainer>
          <StyledMobileAppCta gap={isMobile ? 70 : 110}>
            <img />
            <VStack gap={32}>
              <StyledTitle>Download the mobile app</StyledTitle>
              <StyledText>The mobile app is very cool and you should download it.</StyledText>
              <GalleryLink href="https://apps.apple.com/app/gallery/id6447068892?l=en-US">
                <AppStoreBadge />
              </GalleryLink>
            </VStack>
          </StyledMobileAppCta>
        </PageGutterWrapper>
        <FullWidthWrapper gap={45}>
          <PageGutterWrapper gap={16}>
            <StyledTitle>Featured</StyledTitle>
            <StyledSubTitle>A selection of Collectors, Creators and Galleries</StyledSubTitle>
          </PageGutterWrapper>
          <FeaturedProfiles profiles={pageContent.featuredProfiles} />
        </FullWidthWrapper>
        <PageGutterWrapper gap={32}>
          <StyledTitle>What our users say</StyledTitle>
          <Testimonials testimonials={pageContent.testimonials} />
        </PageGutterWrapper>
        <VStack gap={32}>
          <StyledSubTitle>Start your journey today</StyledSubTitle>
          <Button>
            <StyledGetStartedButtonText>Get started</StyledGetStartedButtonText>
          </Button>
        </VStack>
      </FullWidthWrapper>
    </StyledLandingPage>
  );
}

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
  gap: 16px;

  @media only screen and ${breakpoints.tablet} {
    flex-direction: row;
  }
`;

const StyledMobileAppCta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px 0;
  width: 100%;

  @media only screen and ${breakpoints.tablet} {
    flex-direction: row;
    gap: 0 70px;
  }
`;

const StyledLandingPage = styled.div`
  margin: 0 auto;
  max-width: 1436px;
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

const StyledSubTitle = styled(TitleDiatypeM)`
  font-size: 24px;
  line-height: 32px;
  font-weight: 400;
`;

const FullWidthWrapper = styled(VStack)`
  width: 100%;
`;

const StyledBottomContainer = styled(VStack)`
  align-items: center;
  justify-content: center;

  position: absolute;
  bottom: 16px;
`;

const StyledText = styled(TitleDiatypeL)`
  font-weight: 400;
  font-size: 16px;
  line-height: 20px;
  letter-spacing: -0.03em;
  @media only screen and ${breakpoints.desktop} {
    font-size: 20px;
    line-height: 28px;
  }
`;
const StyledShopText = styled(TitleM)`
  font-family: 'GT Alpina Condensed';
  display: inline;
  height: 16px;
  font-style: normal;
  font-weight: 300;
  font-size: 14.4127px;
  line-height: 16px;
  color: inherit;
`;

const StyledObjectsContainer = styled.div`
  height: 16px;
  display: flex;
  align-items: center;
`;

const StyledLogoBracketLeft = styled(LogoBracketLeft)`
  width: 6px;
  height: 16px;
`;

const StyledLogoBracketRight = styled(LogoBracketRight)`
  width: 6px;
  height: 16px;
`;

const StyledGetStartedButtonText = styled(TitleDiatypeL)`
  color: ${colors.white};
  text-transform: none;
`;
