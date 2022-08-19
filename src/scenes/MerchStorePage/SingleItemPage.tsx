import styled from 'styled-components';
import { BaseM, TitleM } from 'components/core/Text/Text';
import breakpoints, { contentSize, pageGutter } from 'components/core/breakpoints';
import Spacer from 'components/core/Spacer/Spacer';
import FlippingImage from './FlippingImage';
import PurchaseBox from './PurchaseBox';
import { useMintMerchContract } from 'hooks/useContract';
import useMintContractWithQuantity from 'hooks/useMintContractWithQuantity';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { truncateAddress } from 'utils/wallet';
import { useState } from 'react';
import noop from 'utils/noop';

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
  const { address: rawAddress } = useAccount();
  const address = truncateAddress(rawAddress?.toLowerCase() ?? '');

  const { publicSupply, usedPublicSupply, tokenPrice, userOwnedSupply } =
    useMintContractWithQuantity({
      contract,
      tokenId,
    });

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const [isFlipped, setIsFlipped] = useState(false);

  const isMobileAndCard = isMobile && tokenId === 2;

  return (
    <>
      {rawAddress && <StyledConnectedAddress>{address}</StyledConnectedAddress>}
      <StyledPage pushItemsDown={isMobile && userOwnedSupply > 0}>
        <StyledWrapper>
          <StyledImageContainer
            // prevent flipping on mobile detail page as the dimensions look off
            onMouseOver={isMobileAndCard ? noop : () => setIsFlipped(true)}
            onMouseOut={isMobileAndCard ? noop : () => setIsFlipped(false)}
          >
            <FlippingImage isFlipped={isFlipped} src={image} />
          </StyledImageContainer>
          <StyledContent>
            <TitleM>
              {title} {label}
            </TitleM>
            {description.split('\n').map((d, i) => (
              <BaseM key={i}>{d}</BaseM>
            ))}
            {!isMobile && <Spacer height={8} />}
            <StyledPriceQuantityAndPurchaseContainer>
              <StyledPriceAndQuantity>
                <StyledPrice>{ethers.utils.formatEther(tokenPrice)} Ξ each</StyledPrice>
                <BaseM>
                  {typeof publicSupply == 'number' && typeof usedPublicSupply == 'number'
                    ? `${publicSupply - usedPublicSupply} / ${publicSupply} left`
                    : ''}
                </BaseM>
              </StyledPriceAndQuantity>
              {!isMobile && <Spacer height={16} />}
              <PurchaseBox
                label={label}
                tokenId={tokenId}
                // We don't want to disable the button if the user is not logged in. So we don't simply check equality between these two variables, which will be undefined if the user is not logged in.
                disabled={publicSupply - usedPublicSupply == 0}
              />
            </StyledPriceQuantityAndPurchaseContainer>
          </StyledContent>
        </StyledWrapper>
      </StyledPage>
    </>
  );
}

const StyledPage = styled.div<{ pushItemsDown: boolean }>`
  min-height: 100vh;
  padding: 20px 40px;
  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 0 auto;
  max-width: ${contentSize.desktop}px;

  @media only screen and (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    padding: 16px;
    position: relative;

    ${({ pushItemsDown }) =>
      pushItemsDown
        ? 'padding-top: 15vh;'
        : ''}// On small screens that also have a small height, we push to the very bottom - 86px (enough room for the bottom purchase bar)
  }

  @media only screen and (max-width: 768px) and (max-height: 550px) {
    ${({ pushItemsDown }) =>
      pushItemsDown &&
      `justify-content: flex-end;
      padding-bottom: 86px;
      padding-top: 0;`}
  }
`;

const StyledWrapper = styled.div`
  display: grid;
  align-items: center;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;

  @media only screen and (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    gap: 24px;
    width: auto;
    place-items: center;
  }
`;
const StyledContent = styled.div`
  z-index: 1; // appear above flipping image

  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 ${pageGutter.mobile}px;
  width: 360px;
  margin: 0 auto;
  max-width: 90vw;

  @media only screen and ${breakpoints.tablet} {
    margin: 0;
    padding: 0;
  }
`;

const StyledConnectedAddress = styled(BaseM)`
  position: absolute;
  padding: 14px 52px 0px 0px;
  text-align: right;
  width: 100%;
`;

const StyledPriceAndQuantity = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  @media screen and (max-width: 768px) {
    flex-direction: column;
  }
`;

const StyledImageContainer = styled.div`
  width: auto;
  position: relative;
  aspect-ratio: 1;

  @media only screen and (max-width: 768px) {
    width: 200px;
    height: auto;
  }
`;

const StyledPriceQuantityAndPurchaseContainer = styled.div`
  position: relative;

  @media only screen and (max-width: 768px) {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100vw;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #e5e5e5;

    /* Auto layout */
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 12px 16px;
    gap: 12px;

    /* (WHITE) */
    background: #fefefe;

    /* Porcelain */
    border: 1px solid #e2e2e2;
    z-index: 1;
  }
`;

const StyledPrice = styled(BaseM)`
  @media only screen and (max-width: 768px) {
    font-weight: bold;
  }
`;
