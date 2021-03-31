import { useEffect, useMemo, useState } from 'react';
import { isAddress } from 'web3-utils';
import useSwr from 'swr';
import { RouteComponentProps } from '@reach/router';
import styled from 'styled-components';

type Params = {
  usernameOrWalletAddress: string;
};

type Nft = {
  id: string;
  name: string;
  image_url: string;
  image_preview_url: string;
};

const IMG_FALLBACK_URL = 'https://i.ibb.co/q7DP0Dz/no-image.png';

function resize(imgUrl: string, width: number) {
  if (!imgUrl) return null;
  return imgUrl.replace('=s250', `=s${width}`);
}

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log(nfts);

  return (
    <StyledGallery>
      <div>
        <div>{usernameOrWalletAddress}</div>
        {isWalletAddress ? <div>valid wallet address detected</div> : null}
      </div>
      <StyledCollection>
        <StyledOptions>
          <StyledOption selected>All</StyledOption>
          <StyledOption selected={false}>Collections</StyledOption>
        </StyledOptions>
        <Spacer />
        <StyledNfts>
          {nfts.map((nft) => {
            const imgUrl =
              resize(nft.image_preview_url, 275) ||
              nft.image_url ||
              IMG_FALLBACK_URL;

            return (
              <StyledNftPreview key={nft.id}>
                <StyledNft src={imgUrl} alt={nft.name} />
              </StyledNftPreview>
            );
          })}
        </StyledNfts>
      </StyledCollection>
    </StyledGallery>
  );
}

const StyledGallery = styled.div``;

const StyledCollection = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const StyledOptions = styled.div`
  display: flex;
`;

const StyledOption = styled.p<{ selected: boolean }>`
  text-transform: uppercase;
  margin: 0px 10px;

  ${({ selected }) => {
    if (selected) {
      return `
        opacity: 1;
        text-decoration: underline;
      `;
    }
    return `
      opacity: 0.4;
    `;
  }}
`;

const Spacer = styled.div`
  height: 40px;
`;

const StyledNfts = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 900px;
`;

const StyledNftPreview = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  margin: 10px;
`;

const StyledNft = styled.img`
  width: 275px;
`;

export default Gallery;
