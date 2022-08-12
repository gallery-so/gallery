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
import { useState, useCallback, useEffect } from 'react';
// import { OPENSEA_TESTNET_BASEURL } from 'constants/opensea';
import Spacer from 'components/core/Spacer/Spacer';
// import { isFeatureEnabled } from 'utils/featureFlag';
// import { FeatureFlag } from 'components/core/enums';
// import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
// import Image from 'next/image';
import FlippingImage from './FlippingImage';
import PurchaseBox from './PurchaseBox';
import { useMintMerchContract } from 'hooks/useContract';
import { useWeb3React } from '@web3-react/core';
import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import web3 from 'web3';

export default function ItemPage({
  label,
  image,
  title,
  description,
  price,
  tokenId,
}: {
  label: string;
  image: string;
  title: string;
  description: string;
  price: string;
  tokenId: number;
}) {
  const contract = useMintMerchContract();
  const { account: rawAccount } = useWeb3React<Web3Provider>();
  const [publicSupply, setPublicSupply] = useState(0);
  const [usedPublicSupply, setUsedPublicSupply] = useState(0);

  const account = rawAccount?.toLowerCase();

  // FIXME: Use library rather than account is account is not available (user not logged in)?
  const updateSupplies = useCallback(
    async (contract: any, tokenId: number) => {
      // console.log(contract, account);
      // if (contract && account) {
      if (contract) {
        return [
          await contract.getPublicSupply(tokenId),
          await contract.getUsedPublicSupply(tokenId),
        ];
      }
    },
    [account]
  );

  // Run getRemainingSupply once on mount and then update the remaining supply.
  useEffect(() => {
    async function effect() {
      const supplies = await updateSupplies(contract, tokenId);
      const sup = web3.utils.hexToNumber(supplies?.[0]);
      const used = web3.utils.hexToNumber(supplies?.[1]);
      setPublicSupply(sup);
      setUsedPublicSupply(used);
    }

    effect();
    return () => {
      // cleanup
    };
  }, [contract, tokenId, updateSupplies, publicSupply, usedPublicSupply]);

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
            <BaseM>
              {typeof publicSupply == 'number' && typeof usedPublicSupply == 'number'
                ? `${publicSupply - usedPublicSupply}/${publicSupply} left`
                : ''}
            </BaseM>
          </StyledPriceAndQuantity>
          <Spacer height={8} />
          <PurchaseBox
            label={label}
            price={price}
            tokenId={tokenId}
            // We don't want to disable the button if the user is not logged in. So we don't simply check equality between these two variables, which will be undefined if the user is not logged in.
            disabled={publicSupply - usedPublicSupply == 0}
          />
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
