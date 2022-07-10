import styled from 'styled-components';
import { ButtonLink } from 'components/core/Button/Button';
import GalleryIntro from 'components/GalleryTitleIntro/GalleryTitleIntro';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseS } from 'components/core/Text/Text';
import NavLink from 'components/core/NavLink/NavLink';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { FeatureFlag } from 'components/core/enums';
import isFeatureEnabled from 'utils/graphql/isFeatureEnabled';
import { useTrack } from 'contexts/analytics/AnalyticsContext';

export default function LandingPage() {
  const query = useLazyLoadQuery<any>(
    graphql`
      query LandingPageQuery {
        ...isFeatureEnabledFragment
      }
    `,
    {}
  );

  const track = useTrack();

  return (
    <StyledLandingPage>
      <GalleryIntro />
      <Spacer height={24} />
      <StyledButtonContainer>
        <ButtonLink
          href="/auth"
          onClick={() => track('Landing page Sign In button click')}
          data-testid="sign-in-button"
        >
          Sign In
        </ButtonLink>
        {isFeatureEnabled(FeatureFlag.FEED, query) && (
          <>
            <Spacer width={12} />
            <ButtonLink
              href="/home"
              onClick={() => track('Landing page Explore button click')}
              data-testid="explore-button"
              variant="secondary"
            >
              Explore
            </ButtonLink>
          </>
        )}
      </StyledButtonContainer>
      <Spacer height={24} />
      <StyledLinkContainer>
        <NavLink to="/members" dataTestId="explore-button">
          Members
        </NavLink>
        <Spacer width={8} />
        <BaseS>·</BaseS>
        <Spacer width={8} />
        <NavLink to="/noCreative">Gallery of the Week</NavLink>
      </StyledLinkContainer>
    </StyledLandingPage>
  );
}

const StyledLandingPage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  height: 100vh;
`;

const StyledButtonContainer = styled.div`
  display: flex;
`;

const StyledLinkContainer = styled.div`
  display: flex;
`;
