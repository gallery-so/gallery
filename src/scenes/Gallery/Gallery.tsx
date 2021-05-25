import { useMemo } from 'react';
import { isAddress } from 'web3-utils';
import { Redirect, RouteComponentProps } from '@reach/router';
import styled from 'styled-components';

import Header from './components/Header/Header';
import Body from './components/Body/Body';
import Spacer from 'components/core/Spacer/Spacer';
import breakpoints, {
  contentSize,
  pageGutter,
} from 'components/core/breakpoints';
import useUser from 'hooks/api/useUser';

type Params = {
  usernameOrWalletAddress: string;
};

function Gallery({ usernameOrWalletAddress }: RouteComponentProps<Params>) {
  const isWalletAddress = useMemo(
    () => isAddress(usernameOrWalletAddress ?? ''),
    [usernameOrWalletAddress]
  );

  const user = useUser({
    username: isWalletAddress ? undefined : usernameOrWalletAddress,
    address: isWalletAddress ? usernameOrWalletAddress : undefined,
  });

  if (!user) {
    return <Redirect to="/404" />;
  }

  // TODO: in the future, we'll allow users to put in any arbitrary
  //       wallet address to see that addresses's NFTs even if they
  //       don't have an account with us
  // 1) Wallet address is legit, BUT doesn't exist in our DB. Here the backend
  //    should try to pull basic info from opensea about their address and return
  //    it, alongside some encouragement to create an account
  // 2) Wallet address is legit, AND exists in our DB. Here we should simply
  //    redirect to the /username page
  // 3) Wallet address is not legit, redirect 404

  return (
    <StyledGallery>
      <StyledContent>
        <Spacer height={112} />
        <Header user={user} />
        <Body user={user} />
      </StyledContent>
    </StyledGallery>
  );
}

const StyledGallery = styled.div`
  display: flex;
  justify-content: center;
  margin: 0 ${pageGutter.mobile}px;

  @media only screen and ${breakpoints.tablet} {
    margin: 0 ${pageGutter.tablet}px;
  }
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  max-width: ${contentSize.desktop}px;
`;

export default Gallery;
