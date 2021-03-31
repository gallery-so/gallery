import { useMemo } from 'react';
import { isAddress } from 'web3-utils';
import useSwr from 'swr';
import { RouteComponentProps } from '@reach/router';
import styled from 'styled-components';

type Params = {
  usernameOrWalletAddress: string;
};

function Gallery({ usernameOrWalletAddress }: RouteComponentProps<Params>) {
  const baseurl = useMemo(() => {
    return isAddress(usernameOrWalletAddress ?? '') ? '/address' : '/username';
  }, [usernameOrWalletAddress]);

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

  // on dev, this will route to localhost:4000/api/test
  // on prod, this will route to api.gallery.so/api/test
  // const { data, error } = useSwr('/test');
  // console.log('the result', data, error);

  return (
    <StyledGallery>
      gallery of {usernameOrWalletAddress} {baseurl}
    </StyledGallery>
  );
}

const StyledGallery = styled.div``;

export default Gallery;
