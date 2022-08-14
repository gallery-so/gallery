import styled from 'styled-components';
import { ButtonLink } from 'components/core/Button/Button';
import GalleryIntro from 'components/GalleryTitleIntro/GalleryTitleIntro';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseS, TitleM } from 'components/core/Text/Text';
import NavLink from 'components/core/NavLink/NavLink';
import { useTrack } from 'contexts/analytics/AnalyticsContext';

export default function LandingPage() {
  const track = useTrack();

  return (
    <StyledLandingPage>
      <StyledLogo src="/icons/logo-large.svg" />
      <StyledTextAndButtonsContainer>
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
      </StyledTextAndButtonsContainer>
      <StyledBottomContainer>
        <StyledLinkContainer>
          <NavLink to="/members">Members</NavLink>
          <Spacer width={8} />
          <BaseS>·</BaseS>
          <Spacer width={8} />
          <NavLink to="/1of1">Gallery of the Week</NavLink>
        </StyledLinkContainer>
        <Spacer height={12} />
        <NavLink to="/shop">
          Shop
          <StyledShopText>( OBJECTS )</StyledShopText>
        </NavLink>
      </StyledBottomContainer>
    </StyledLandingPage>
  );
}

const StyledLogo = styled.img`
  height: 32px;
`;

const StyledLandingPage = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  padding: 16px 0;

  height: 100vh;
`;

const StyledTextAndButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
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
`;

const StyledShopText = styled(TitleM)`
  font-family: 'GT Alpina Condensed';
  display: inline;
  width: 52px;
  height: 16px;
  margin-left: 5.28px;
  font-style: normal;
  font-weight: 300;
  font-size: 14.4127px;
  line-height: 16px;
  color: inherit;
`;
