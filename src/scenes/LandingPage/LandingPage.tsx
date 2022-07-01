import { memo, useCallback } from 'react';
import styled from 'styled-components';
import Button from 'components/core/Button/Button';
import GalleryIntro from 'components/GalleryTitleIntro/GalleryTitleIntro';
import { useRouter } from 'next/router';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseS } from 'components/core/Text/Text';
import NavLink from 'components/core/NavLink/NavLink';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { FeatureFlag } from 'components/core/enums';
import isFeatureEnabled from 'utils/graphql/isFeatureEnabled';
import SuppressedHrefWrapper from 'components/core/Button/SuppressedHrefWrapper';

function LandingPage() {
  const query = useLazyLoadQuery<any>(
    graphql`
      query LandingPageQuery {
        ...isFeatureEnabledFragment
      }
    `,
    {}
  );

  const { push } = useRouter();

  const handleEnterGallery = useCallback(() => {
    // If the user is already authenticated, /auth will handle forwarding
    // them directly to their profile
    void push('/auth');
  }, [push]);

  // TODO: change to href
  const handleExploreClick = useCallback(() => {
    void push('/home');
  }, [push]);

  return (
    <StyledLandingPage>
      <GalleryIntro />
      <Spacer height={24} />
      <StyledButtonContainer>
        <SuppressedHrefWrapper href="/auth">
          <Button text="Sign In" onClick={handleEnterGallery} dataTestId="sign-in-button" />
        </SuppressedHrefWrapper>
        {isFeatureEnabled(FeatureFlag.FEED, query) && (
          <>
            <Spacer width={12} />
            <SuppressedHrefWrapper href="/home">
              <Button
                text="Explore"
                type="secondary"
                onClick={handleExploreClick}
                dataTestId="explore-button"
              />
            </SuppressedHrefWrapper>
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
        <NavLink to="/salt">Gallery of the Week</NavLink>
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

export default memo(LandingPage);
