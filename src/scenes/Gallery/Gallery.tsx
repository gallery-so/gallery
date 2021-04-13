import { useEffect, useMemo, useState } from 'react';
import { isAddress } from 'web3-utils';
import useSwr from 'swr';
import { RouteComponentProps } from '@reach/router';
import styled from 'styled-components';

import Header from './components/Header';
import Body from './components/Body';
import Spacer from 'components/core/Spacer/Spacer';

import { Nft } from 'types/Nft';

type Params = {
  usernameOrWalletAddress: string;
};

function Gallery({ usernameOrWalletAddress }: RouteComponentProps<Params>) {
  const isWalletAddress = useMemo(
    () => isAddress(usernameOrWalletAddress ?? ''),
    [usernameOrWalletAddress]
  );

  const baseurl = isWalletAddress ? '/address' : 'username';

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

  const [nfts, setNfts] = useState<Nft[]>([]);

  // TODO: this is hard-coded here for now; should be proxied through our server
  useEffect(() => {
    async function getOpenseaData(address: string) {
      const url = `https://api.opensea.io/api/v1/assets?owner=${address}&order_direction=desc&&limit=50`;
      const res = await fetch(url);
      const data = await res.json();
      setNfts(data.assets);
    }

    if (usernameOrWalletAddress && isWalletAddress) {
      getOpenseaData(usernameOrWalletAddress);
    }
  }, [isWalletAddress, usernameOrWalletAddress]);

  let collections = [
    {
      title: 'Collection 1',
      description: 'This is a test collection',
      id: 'id',
      nfts: nfts.slice(0, 10),
    },
    {
      title: 'Collection 2',
      id: 'id',
      nfts: nfts.slice(11, 20),
    },
  ];

  return (
    <StyledGallery>
      <Header usernameOrWalletAddress={'RogerKilimanjaro'} />
      <Spacer height={40} />
      <Body collections={collections} />
    </StyledGallery>
  );
}

const StyledGallery = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default Gallery;
