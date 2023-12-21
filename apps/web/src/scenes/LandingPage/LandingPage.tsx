import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button, DeprecatedButtonLink } from '~/components/core/Button/Button';
import NavLink from '~/components/core/NavLink/NavLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import {
  BaseS,
  BlueLabel,
  TitleDiatypeL,
  TitleDiatypeM,
  TitleM,
} from '~/components/core/Text/Text';
import GalleryIntro from '~/components/GalleryTitleIntro/GalleryTitleIntro';
import LogoBracketLeft from '~/icons/LogoBracketLeft';
import LogoBracketRight from '~/icons/LogoBracketRight';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import colors from '~/shared/theme/colors';

import { CmsTypes } from '../ContentPages/cms_types';
import FeaturedProfiles from '../ContentPages/ContentModules/FeaturedProfiles';
import FeatureHighlight from '../ContentPages/ContentModules/FeatureHighlight';
import Testimonials from '../ContentPages/ContentModules/Testimonials';
import WelcomeAnimation from '../WelcomeAnimation/WelcomeAnimation';
import LandingCoverAnimation from './LandingCoverAnimation';

const GALLERY_OF_THE_WEEK_USER = 'masisus';

const MOBILE_PAGE_GUTTER = 32;
const DESKTOP_PAGE_GUTTER = 60;

type Props = {
  pageContent: any;
};

export default function LandingPage({ pageContent }: Props) {
  const track = useTrack();

  console.log(pageContent);

  return (
    <StyledLandingPage>
      <VStack gap={130} justify="center" align="center">
        <LandingCoverAnimation />
        {/* <GalleryIntro />
        <HStack gap={12}>
          <DeprecatedButtonLink
            href={{ pathname: '/auth' }}
            onClick={() => track('Landing page Sign In button click')}
            data-testid="sign-in-button"
          >
            Sign In
          </DeprecatedButtonLink>
          <DeprecatedButtonLink
            href={{ pathname: '/home' }}
            onClick={() => track('Landing page Explore button click')}
            variant="secondary"
          >
            Explore
          </DeprecatedButtonLink>
        </HStack> */}
        {/* <WelcomeAnimation /> */}

        <FeatureHighlight content={pageContent.highlight1} />
        <PageGutterWrapper gap={16}>
          <HStack gap={16}>
            {pageContent.miniFeatureHighlights.map(
              (featureHighlight: CmsTypes.FeatureHighlight) => (
                <FeatureHighlight
                  key={featureHighlight._type}
                  content={featureHighlight}
                  variant="condensed"
                />
              )
            )}
          </HStack>
        </PageGutterWrapper>
        <FullWidthWrapper gap={45}>
          <PageGutterWrapper gap={16}>
            <StyledTitle>Featured</StyledTitle>
            <StyledSubTitle>A selection of Collectors, Creators and Galleries</StyledSubTitle>
          </PageGutterWrapper>
          <FeaturedProfiles profiles={pageContent.featuredProfiles} />
        </FullWidthWrapper>
        <FeatureHighlight content={pageContent.highlight2} />
        <PageGutterWrapper gap={32}>
          <StyledTitle>What our users say</StyledTitle>
          <Testimonials testimonials={pageContent.testimonials} />
        </PageGutterWrapper>
        <VStack gap={32}>
          <StyledSubTitle>Start your journey today</StyledSubTitle>
          <Button>Get Started</Button>
        </VStack>
      </VStack>

      {/* <StyledBottomContainer gap={12}>
        <HStack gap={8}>
          <NavLink to={{ pathname: '/members' }}>Members</NavLink>
          <BaseS>·</BaseS>
          <NavLink to={{ pathname: '/[username]', query: { username: GALLERY_OF_THE_WEEK_USER } }}>
            Gallery of the Week
          </NavLink>
        </HStack>
        <NavLink to={{ pathname: '/shop' }}>
          <HStack gap={6}>
            Shop
            <StyledObjectsContainer>
              <StyledLogoBracketLeft color={colors.shadow} />
              <StyledShopText>OBJECTS</StyledShopText>
              <StyledLogoBracketRight color={colors.shadow} />
            </StyledObjectsContainer>
            <BlueLabel>New</BlueLabel>
          </HStack>
        </NavLink>
      </StyledBottomContainer> */}
    </StyledLandingPage>
  );
}

const PageGutterWrapper = styled(VStack)`
  padding: 0 ${MOBILE_PAGE_GUTTER}px;

  @media only screen and ${breakpoints.desktop} {
    padding: 0 ${DESKTOP_PAGE_GUTTER}px;
  }
`;

const StyledLandingPage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 16px 0;
`;

const StyledTitle = styled(TitleDiatypeL)`
  font-size: 40px;
  line-height: 56px;
  font-weight: 400;
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
