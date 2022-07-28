import { memo, useEffect } from 'react';

import WalletSelector from 'components/WalletSelector/WalletSelector';
import { BaseM } from 'components/core/Text/Text';
import styled from 'styled-components';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import breakpoints from 'components/core/breakpoints';
import Spacer from 'components/core/Spacer/Spacer';

// Preloading images for the welcome screen
import { animatedImages } from 'src/scenes/WelcomeAnimation/Images';
import { graphql, useFragment } from 'react-relay';
import { AuthFragment$key } from '__generated__/AuthFragment.graphql';

const preloadImages = () => {
  animatedImages.forEach((image) => {
    const img = new Image();
    img.src = image.src ?? '';
  });
};

type Props = {
  queryRef: AuthFragment$key;
};

function Auth({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment AuthFragment on Query {
        viewer {
          ... on Viewer {
            __typename
            user {
              username
            }
          }
        }
        ...WalletSelectorFragment
      }
    `,
    queryRef
  );

  const { viewer } = query;

  // Before the welcome screen, we should preload images so that the animation is smooth
  useEffect(preloadImages, []);

  if (viewer?.__typename === 'Viewer' && viewer.user) {
    // If user exists in DB, send them to their profile
    if (viewer.user.username) {
      return <GalleryRedirect to="/home" />;
    }

    // This should never happen
    throw new Error('Error: user without a username. Please contact support.');
  }

  return (
    <StyledAuthPage>
      <StyledWalletSelectorWrapper>
        <WalletSelector queryRef={query} />
      </StyledWalletSelectorWrapper>
      <StyledBaseM>
        Gallery is non-custodial and secure.{'\n'} We will never request access to your NFTs.
      </StyledBaseM>
      <Spacer height={32} />
    </StyledAuthPage>
  );
}

const StyledAuthPage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  height: 100vh;
`;

const StyledWalletSelectorWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
`;

const StyledBaseM = styled(BaseM)`
  text-align: center;
  white-space: pre-line;

  @media only screen and ${breakpoints.tablet} {
    white-space: initial;
  }
`;

export default memo(Auth);
