import { useEffect, useMemo, useState } from 'react';
import { isAddress } from 'web3-utils';
import useSwr from 'swr';
import { RouteComponentProps } from '@reach/router';
import styled from 'styled-components';
import { Link } from '@reach/router';

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

const ADDRESSES = {
  mikey: '0xBb3F043290841B97b9C92F6Bc001a020D4B33255',
  robin: '0x70d04384b5c3a466ec4d8cfb8213efc31c6a9d15',
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

  console.log(nfts);

  return (
    <StyledGallery>
      <StyledCollection>
        <StyledHeader>
          <StyledUsername>{'joff' || usernameOrWalletAddress}</StyledUsername>
          <StyledUserDetails>
            <DetailRow>Collector Since Mar 2021</DetailRow>
            <DetailRow>
              Web Developer. Consumer Of Pizza, Caffeine And Curry. Organiser of
              Events. Co-Founder Of
            </DetailRow>
            <DetailRow>
              @Dpipboro and @Pborostemfestival. Twitter: @Joffff
            </DetailRow>
          </StyledUserDetails>
          <StyledLinks>
            <StyledLink underlined>
              <Link to={`/${ADDRESSES.robin}`}>Follow</Link>
            </StyledLink>
            <StyledLink underlined>Share</StyledLink>
          </StyledLinks>
        </StyledHeader>
        <Spacer height={40} />
        <StyledToggleOptions>
          <StyledToggleOption underlined focused>
            All
          </StyledToggleOption>
          <StyledToggleOption>Collections</StyledToggleOption>
        </StyledToggleOptions>
        <Spacer height={40} />
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

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;
  max-width: 1111px;
`;

const StyledUsername = styled.div`
  font-size: 50px;
`;

const StyledUserDetails = styled.p`
  font-family: 'Helvetica Neue';
  font-size: 12px;
`;

const DetailRow = styled.div`
  opacity: 0.5;
`;

const StyledLinks = styled.p`
  font-size: 12px;

  display: flex;
`;

const StyledOption = styled.p<{ underlined?: boolean; focused?: boolean }>`
  font-family: 'Helvetica Neue';
  text-transform: uppercase;
  margin-top: 0px;
  margin-bottom: 0px;

  opacity: ${({ focused }) => (focused ? 1 : 0.5)};
  text-decoration: ${({ underlined }) => (underlined ? 'underline' : '')};
`;

const StyledLink = styled(StyledOption)`
  margin-right: 10px;
`;

const StyledCollection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledToggleOptions = styled.div`
  display: flex;
`;

const StyledToggleOption = styled(StyledOption)`
  margin-right: 10px;
  margin-left: 10px;
`;

const Spacer = styled.div<{ height?: number }>`
  height: ${({ height }) => (height ? height : 0)}px;
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
