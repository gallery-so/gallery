import { useMemo, useState } from 'react';
import { isAddress } from 'web3-utils';
import useSwr from 'swr';
import { Redirect, RouteComponentProps } from '@reach/router';
import styled from 'styled-components';

import Header from './components/Header/Header';
import Body from './components/Body/Body';
import Spacer from 'components/core/Spacer/Spacer';
import breakpoints, {
  contentSize,
  pageGutter,
} from 'components/core/breakpoints';

type Params = {
  usernameOrWalletAddress: string;
};

function Gallery({ usernameOrWalletAddress }: RouteComponentProps<Params>) {
  const isWalletAddress = useMemo(
    () => isAddress(usernameOrWalletAddress ?? ''),
    [usernameOrWalletAddress]
  );

  const queryParams = isWalletAddress
    ? `address=${usernameOrWalletAddress}`
    : `username=${usernameOrWalletAddress}`;

  const { data } = useSwr(`/users/get?${queryParams}`);

  if (data.error) {
    return <Redirect to="/404" />;
  }

  // on dev, this will route to localhost:4000/api/address/...
  // on prod, this will route to api.gallery.so/api/address/...
  //   const { data, error } = useSwr(`${baseurl}/${usernameOrWalletAddress}`)
  // TODO: support the following possible states:
  // 1) Wallet address is legit, BUT doesn't exist in our DB. Here the backend
  //    should try to pull basic info from opensea about their address and return
  //    it, alongside some encouragement to create an account
  // 2) Wallet address is legit, AND exists in our DB. Here we should simply
  //    redirect to the /username page
  // 3) Wallet address is not legit, redirect 404
  // 4) Username exists in our DB, display collection
  // 5) Username doesn't exist on our DB, redirect 404

  return (
    <StyledGallery>
      <StyledContent>
        <Spacer height={112} />
        {/*
          TODO: in the future, we'll allow users to put in any arbitrary
          wallet address to see that addresses's NFTs even if they don't have
          an account with us */}
        <Header user={data} />
        <Body />
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
