import styled from 'styled-components';
import { BaseM, TitleM } from 'components/core/Text/Text';
import { contentSize, pageGutter } from 'components/core/breakpoints';
// import { MINT_DATE, NFT_TOKEN_ID } from 'constants/poster';
// import ItemImage from './ItemImage';
// import { GALLERY_MEMORABILIA_CONTRACT_ADDRESS } from 'hooks/useContract';
// import { useWeb3React } from '@web3-react/core';
// import { Web3Provider } from '@ethersproject/providers';
// import { useState, useCallback, useEffect } from 'react';
import Spacer from 'components/core/Spacer/Spacer';
// import { isFeatureEnabled } from 'utils/featureFlag';
// import { FeatureFlag } from 'components/core/enums';
// import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
// import Image from 'next/image';
import FlippingImage from './FlippingImage';
import PurchaseBox from './PurchaseBox';
import { useMintMerchContract } from 'hooks/useContract';
import useMintContractWithQuantity from 'hooks/useMintContractWithQuantity';

export default function ItemPage({
  label,
  image,
  title,
  description,
  tokenId,
}: {
  label: string;
  image: string;
  title: string;
  description: string;
  tokenId: number;
}) {
  const contract = useMintMerchContract();

  const { publicSupply, usedPublicSupply, tokenPrice } = useMintContractWithQuantity({
    contract,
    tokenId,
  });

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
            <BaseM>{tokenPrice} Ξ each</BaseM>
            <BaseM>
              {typeof publicSupply == 'number' && typeof usedPublicSupply == 'number'
                ? `${publicSupply - usedPublicSupply} / ${publicSupply} left`
                : ''}
            </BaseM>
          </StyledPriceAndQuantity>
          <Spacer height={8} />
          <PurchaseBox
            label={label}
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
    padding: 16px;
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
