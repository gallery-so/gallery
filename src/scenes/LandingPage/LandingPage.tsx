import styled from 'styled-components';
import { ButtonLink } from 'components/core/Button/Button';
import GalleryIntro from 'components/GalleryTitleIntro/GalleryTitleIntro';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseS, TitleM, BlueLabel } from 'components/core/Text/Text';
import NavLink from 'components/core/NavLink/NavLink';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import LogoBracketLeft from 'icons/LogoBracketLeft';
import LogoBracketRight from 'icons/LogoBracketRight';
import colors from 'components/core/colors';

export default function LandingPage() {
  const track = useTrack();

  return (
    <StyledLandingPage>
      <GalleryIntro />
      <Spacer height={12} />
      <StyledButtonContainer>
        <ButtonLink
          href="/auth"
          onClick={() => track('Landing page Sign In button click')}
          data-testid="sign-in-button"
        >
          Sign In
        </ButtonLink>
        <Spacer width={12} />
        <ButtonLink
          href="/home"
          onClick={() => track('Landing page Explore button click')}
          data-testid="explore-button"
          variant="secondary"
        >
          Explore
        </ButtonLink>
      </StyledButtonContainer>
      <StyledBottomContainer>
        <StyledLinkContainer>
          <NavLink to="/members">Members</NavLink>
          <Spacer width={8} />
          <BaseS>·</BaseS>
          <Spacer width={8} />
          <NavLink to="/shatt">Gallery of the Week</NavLink>
        </StyledLinkContainer>
        <Spacer height={12} />
        <NavLink to="/shop">
          <StyledShopLinkContainer>
            Shop
            <Spacer width={6} />
            <StyledObjectsContainer>
              <StyledLogoBracketLeft color={colors.shadow} />
              <StyledShopText>OBJECTS</StyledShopText>
              <StyledLogoBracketRight color={colors.shadow} />
            </StyledObjectsContainer>
            <Spacer width={6} />
            <BlueLabel>New</BlueLabel>
          </StyledShopLinkContainer>
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

const StyledButtonContainer = styled.div`
  display: flex;
`;

const StyledLinkContainer = styled.div`
  display: flex;
`;

const StyledBottomContainer = styled.div`
  display: flex;
  flex-direction: column;
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

const StyledShopLinkContainer = styled.div`
  display: flex;
  align-items: center;
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
