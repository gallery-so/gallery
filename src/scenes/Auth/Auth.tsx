import { memo, useEffect } from 'react';

import WalletSelector from 'components/WalletSelector/WalletSelector';
import Page from 'components/core/Page/Page';
import useIsAuthenticated from 'contexts/auth/useIsAuthenticated';
import { usePossiblyAuthenticatedUser } from 'hooks/api/users/useUser';
import { Caption } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import styled from 'styled-components';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import breakpoints from 'components/core/breakpoints';
import Spacer from 'components/core/Spacer/Spacer';

// Preloading images for the welcome screen
import { animatedImages } from 'src/scenes/WelcomeAnimation/Images';

const preloadImages = () => {
  animatedImages.forEach((image) => {
    const img = new Image();
    img.src = image.src;
  });
};

function Auth() {
  // Whether the user is web3-authenticated
  const isAuthenticated = useIsAuthenticated();
  const user = usePossiblyAuthenticatedUser();
  const username = user?.username;

  // Before the welcome screen, we should preload images so that the animation is smooth
  // NOTE: This means that we preload images for *all* users on /auth, not just new users
  // This is a necessary tradeoff because the Welcome screen is the first screen for new users,
  // So there is no 'buffer' screen where we could preload images
  useEffect(() => {
    preloadImages();
  });

  if (isAuthenticated) {
    // If user exists in DB, send them to their profile
    if (username) {
      return <GalleryRedirect to={`/${username}`} />;
    }

    // If user is authenticated but hasn't set their username yet.
    // we should continue to take them through the welcome flow.
    // this can happen if a user signs up and has a valid jwt but
    // hasn't set their username yet.
    return <GalleryRedirect to="/welcome" />;
  }

  return (
    <StyledAuthPage centered>
      <StyledWalletSelectorWrapper>
        <WalletSelector />
      </StyledWalletSelectorWrapper>
      <Spacer height={32} />
      <StyledCaption color={colors.gray50}>
        Gallery is non-custodial and secure.{'\n'} We will never request access to your NFTs.
      </StyledCaption>
    </StyledAuthPage>
  );
}

const StyledAuthPage = styled(Page)`
  margin: 0 16px;
`;

const StyledWalletSelectorWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
`;

const StyledCaption = styled(Caption)`
  text-align: center;
  white-space: pre-line;

  @media only screen and ${breakpoints.tablet} {
    white-space: initial;
  }
`;

export default memo(Auth);
