import styled from 'styled-components';
import { ButtonLink } from 'components/core/Button/Button';
import GalleryIntro from 'components/GalleryTitleIntro/GalleryTitleIntro';
import { BaseS, TitleM, BlueLabel } from 'components/core/Text/Text';
import NavLink from 'components/core/NavLink/NavLink';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import LogoBracketLeft from 'icons/LogoBracketLeft';
import LogoBracketRight from 'icons/LogoBracketRight';
import colors from 'components/core/colors';
import { HStack, VStack } from 'components/core/Spacer/Stack';

export default function LandingPage() {
  const track = useTrack();

  return (
    <StyledLandingPage>
      <VStack gap={12} justify="center" align="center">
        <GalleryIntro />
        <HStack gap={12}>
          <ButtonLink
            href="/auth"
            onClick={() => track('Landing page Sign In button click')}
            data-testid="sign-in-button"
          >
            Sign In
          </ButtonLink>
          <ButtonLink
            href="/home"
            onClick={() => track('Landing page Explore button click')}
            data-testid="explore-button"
            variant="secondary"
          >
            Explore
          </ButtonLink>
        </HStack>
      </VStack>
      <StyledBottomContainer gap={12}>
        <HStack gap={8}>
          <NavLink to="/members">Members</NavLink>
          <BaseS>·</BaseS>
          <NavLink to="/qaulv">Gallery of the Week</NavLink>
        </HStack>
        <NavLink to="/shop">
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
      </StyledBottomContainer>
    </StyledLandingPage>
  );
}

const StyledLandingPage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 16px 0;

  height: 100vh;
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
