import styled from 'styled-components';
import { BaseM, TitleM } from 'components/core/Text/Text';
import { contentSize, pageGutter } from 'components/core/breakpoints';
import colors from 'components/core/colors';
// import PosterFigmaFrame from './PosterFigmaFrame';
// import ActionText from 'components/core/ActionText/ActionText';
// import StyledBackLink from 'components/NavbarBackLink/NavbarBackLink';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
// import useTimer from 'hooks/useTimer';
import HorizontalBreak from 'components/core/HorizontalBreak/HorizontalBreak';
// import { MINT_DATE, NFT_TOKEN_ID } from 'constants/poster';
// import ItemImage from './ItemImage';
// import { GALLERY_MEMORABILIA_CONTRACT_ADDRESS } from 'hooks/useContract';
// import { useWeb3React } from '@web3-react/core';
// import { Web3Provider } from '@ethersproject/providers';
import { useState } from 'react';
// import { OPENSEA_TESTNET_BASEURL } from 'constants/opensea';
import Spacer from 'components/core/Spacer/Spacer';
// import { isFeatureEnabled } from 'utils/featureFlag';
// import { FeatureFlag } from 'components/core/enums';
// import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
// import Image from 'next/image';
// import MerchMintButton from './MerchMintButton';
import FlippingImage from './FlippingImage';
import PurchaseBox from './PurchaseBox';

export default function ItemPage({
  label,
  image,
  title,
  description,
  price,
}: {
  label: string;
  image: string;
  title: string;
  description: string;
  price: string;
}) {
  const isMobile = useIsMobileWindowWidth();

  // const FIGMA_URL = 'https://www.figma.com/file/Opg7LD36QqoVb2JyOa4Kwi/Poster-Page?node-id=0%3A1';
  // const BRAND_POST_URL = 'https://gallery.mirror.xyz/1jgwdWHqYF1dUQ0YoYf-hEpd-OgJ79dZ5L00ArBQzac';

  //   const { timestamp } = useTimer(MINT_DATE);
  // const { account: rawAccount } = useWeb3React<Web3Provider>();
  // const account = rawAccount?.toLowerCase();
  //   const [isMinted, setIsMinted] = useState(false);

  // const handleBackClick = () => {
  //   window.history.back();
  // };

  //   async function detectOwnedPosterNftFromOpensea(account: string) {
  //     const response = await fetch(
  //       `${OPENSEA_TESTNET_BASEURL}/api/v1/assets?owner=${account}&asset_contract_addresses=${GALLERY_MEMORABILIA_CONTRACT_ADDRESS}&token_ids=${NFT_TOKEN_ID}`,
  //       {}
  //     );

  //     const responseBody = await response.json();
  //     return responseBody.assets.length > 0;
  //   }

  // useEffect(() => {
  //   async function checkIfMinted(account: string) {
  //     const hasOwnedPosterNft = false; // await detectOwnedPosterNftFromOpensea(account);
  //     setIsMinted(hasOwnedPosterNft);
  //   }

  //   if (account) {
  //     checkIfMinted(account);
  //   }
  // }, [account]);

  return (
    <StyledPage>
      <StyledWrapper>
        <StyledImageContainer>
          <FlippingImage src={image} />
        </StyledImageContainer>
        <StyledContent>
          <TitleM>
            {title} {label}
          </TitleM>
          <BaseM>{description}</BaseM>
          <Spacer height={8} />
          <StyledPriceAndQuantity>
            <BaseM>{price} Ξ each</BaseM>
            <BaseM>400/600 left</BaseM>
          </StyledPriceAndQuantity>

          {/* {!isMobile && <HorizontalBreak />} */}
          <Spacer height={8} />
          <PurchaseBox label={label} price={price} />
          {/* <StyledShippingText>Shipping available Fall 2023.</StyledShippingText> */}

          {/* {isFeatureEnabled(FeatureFlag.POSTER_MINT) ? (
            <>
              {isMinted ? (
                <BaseXL>You've succesfully minted this poster.</BaseXL>
              ) : (
                <StyledCallToAction>
                  <BaseXL>{timestamp}</BaseXL>
                  <PosterMintButton onMintSuccess={() => setIsMinted(true)}></PosterMintButton>
                </StyledCallToAction>
              )}
            </>
          ) : (
            <StyledCallToAction hasEnded>
              <BaseXL>Mint opening soon.</BaseXL>
            </StyledCallToAction>
          )} */}
        </StyledContent>
      </StyledWrapper>
    </StyledPage>
  );
}

const StyledPage = styled.div`
  min-height: 100vh;
  padding: 20px 40px;
  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 0 auto;
  max-width: ${contentSize.desktop}px;

  @media (max-width: ${contentSize.desktop}px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    padding: 0px 16px;
  }
`;

const StyledWrapper = styled.div`
  display: grid;
  align-items: center;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: ${contentSize.desktop}px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    gap: 24px;
    width: auto;
    place-items: center;
  }
`;
const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 ${pageGutter.mobile}px;
  // max-width: 360px;
  width: 360px;
  margin: 0 auto;

  @media (max-width: ${contentSize.desktop}px) {
    margin: 0;
    padding: 0;
  }
`;

const StyledPriceAndQuantity = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const StyledImageContainer = styled.div`
  width: auto;
  // height: 100%;
  height: 500px;
  position: relative;
  aspect-ratio: 1;
`;

// const StyledShippingText = styled(BaseM)`
//   color: ${colors.metal};
// `;
