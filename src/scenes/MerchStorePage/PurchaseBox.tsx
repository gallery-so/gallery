import styled from 'styled-components';
import { Button } from 'components/core/Button/Button';
import { useState, useCallback } from 'react';
import colors from 'components/core/colors';
import { BaseM, BaseXL, TitleDiatypeL } from 'components/core/Text/Text';
import HorizontalBreak from 'components/core/HorizontalBreak/HorizontalBreak';
import Spacer from 'components/core/Spacer/Spacer';
import { useMintMerchContract } from 'hooks/useContract';
import useMintContractWithQuantity from 'hooks/useMintContractWithQuantity';

import MerchMintButton from './MerchMintButton';
import CircleMinusIcon from 'src/icons/CircleMinusIcon';
import CirclePlusIcon from 'src/icons/CirclePlusIcon';
import { MAX_NFTS_PER_WALLET } from './constants';
import breakpoints, { contentSize, pageGutter } from 'components/core/breakpoints';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
import { ethers } from 'ethers';
import { DecoratedCloseIcon } from 'src/icons/CloseIcon';

export default function PurchaseBox({
  label,
  tokenId,
  disabled,
}: {
  label: string;
  tokenId: number;
  disabled: boolean;
}) {
  const [quantity, setQuantity] = useState(1);
  const [showBox, setShowBox] = useState(false);
  const [isReceiptState, setIsReceiptState] = useState(false);

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const contract = useMintMerchContract();

  const { userOwnedSupply, active, tokenPrice } = useMintContractWithQuantity({
    contract,
    tokenId,
  });

  const maxQuantity = useCallback(() => {
    return MAX_NFTS_PER_WALLET - userOwnedSupply;
  }, [userOwnedSupply]);

  const toggleShowBox = useCallback(() => {
    if (disabled) return;
    setShowBox(true);
    // setIsReceiptState(true); // TO DISPLAY THE RECEIPT STATE FOR TESTING
  }, [disabled]);

  const handlePurchaseClick = useCallback(() => {
    setIsReceiptState(true);
  }, [setIsReceiptState]);

  function UserOwnsBox({ inReceipt }: { inReceipt: boolean }) {
    return (
      <>
        <UserOwnsContainer inReceipt={inReceipt}>
          <StyledFlexContainer>
            <StyledBaseM>Quantity bought</StyledBaseM>
            <StyledBaseM>{userOwnedSupply}</StyledBaseM>
          </StyledFlexContainer>
          <Spacer height={4} />
          <HorizontalBreak />
          <Spacer height={4} />
          <StyledFlexContainer>
            <StyledBaseM>Total paid</StyledBaseM>
            <StyledPrice>
              {(userOwnedSupply * +ethers.utils.formatEther(tokenPrice)).toFixed(2)} Ξ
            </StyledPrice>
          </StyledFlexContainer>
        </UserOwnsContainer>
        <Spacer height={8} />
      </>
    );
  }

  function MobileReceiptBox() {
    return (
      <StyledCheckoutBox showBox={showBox} isReceiptState={isReceiptState}>
        {/* <StyledCloseIcon
          onClick={() => {
            setShowBox(false);
            setIsReceiptState(false);
          }}
        /> */}
        <StyledCheckoutTitle>
          You've bought {quantity} {quantity == 1 ? label : `${label}s`}
        </StyledCheckoutTitle>
        <StyledCheckoutDescription>
          You will be able to redeem the physical {label.toLowerCase()} in Fall 2023.
        </StyledCheckoutDescription>
        {label === 'Shirt' && (
          <StyledCheckoutDescription>
            Disclaimer: We cannot guarantee your size, as there is a limited quantity of each size.
          </StyledCheckoutDescription>
        )}
        <UserOwnsBox inReceipt={true} />
      </StyledCheckoutBox>
    );
  }

  return (
    <>
      {isMobile && isReceiptState && <MobileReceiptBox />}
      {isMobile && !isReceiptState && userOwnedSupply > 0 && <UserOwnsBox inReceipt={false} />}

      {isMobile && (showBox || isReceiptState) && (
        <StyledTapOutToClose
          onClick={() => {
            setShowBox(false);
            setIsReceiptState(false);
          }}
        />
      )}

      <StyledPurchaseBox>
        {isMobile && (
          <StyledPageOverlay onClick={() => setShowBox(false)} show={showBox && !isReceiptState} />
        )}
        <ExpandPurchaseButton onClick={toggleShowBox} show={!showBox} disabled={disabled}>
          Purchase
        </ExpandPurchaseButton>
        <StyledCheckoutAndReceiptContainer showBox={showBox}>
          {userOwnedSupply > 0 && !isMobile && <UserOwnsBox inReceipt={false} />}
          {/* On mobile, we want to hide the below box UNLESS the user is checking out.
          On desktop, we want to show no matter what, and dynamically render different text for the receipt/checkout state. */}
          <StyledCheckoutBox
            showBox={isMobile ? showBox && !isReceiptState : showBox}
            isReceiptState={isReceiptState}
          >
            {isMobile && !isReceiptState && (
              <StyledCloseIcon
                onClick={() => {
                  setShowBox(false);
                  setIsReceiptState(false);
                }}
              />
            )}
            <StyledCheckoutTitle>
              {isReceiptState
                ? `You've bought ${quantity} ${quantity == 1 ? label : `${label}s`}.`
                : `Check out NFT(s)`}
            </StyledCheckoutTitle>
            <StyledCheckoutDescription>
              {isReceiptState
                ? `You will be able to redeem the physical ${label.toLowerCase()} in Fall 2023.`
                : `You are buying the NFT. Indicate the quantity you’d like to purchase, and you will be
            able to redeem the physical ${label.toLowerCase()}s in Fall 2023.`}
            </StyledCheckoutDescription>
            {label === 'Shirt' && (
              <StyledCheckoutDescription>
                Disclaimer: We cannot guarantee your size, as there is a limited quantity of each
                size.
              </StyledCheckoutDescription>
            )}
            <StyledFlexContainer>
              <StyledBaseM>{isReceiptState ? 'Quantity bought' : 'Quantity'}</StyledBaseM>
              <StyledQuantityCounter>
                <StyledColumnButton
                  onClick={() => {
                    setQuantity(quantity - 1);
                  }}
                  disabled={quantity <= 1 || isReceiptState || !active}
                >
                  <CircleMinusIcon />
                </StyledColumnButton>
                <StyledQuantity>{quantity}</StyledQuantity>
                <StyledColumnButton
                  onClick={() => {
                    setQuantity(quantity + 1);
                  }}
                  disabled={quantity >= maxQuantity() || isReceiptState || !active}
                >
                  <CirclePlusIcon />
                </StyledColumnButton>
              </StyledQuantityCounter>
            </StyledFlexContainer>
            <Spacer height={4} />
            <HorizontalBreak />
            <Spacer height={4} />
            <StyledPayAndPurchaseContainer>
              <StyledFlexContainerColumnOnMobile>
                <StyledBaseM>{isReceiptState ? 'Total paid' : 'Pay today'}</StyledBaseM>
                <StyledPrice>
                  {(+ethers.utils.formatEther(tokenPrice) * quantity).toFixed(2)} Ξ
                </StyledPrice>
              </StyledFlexContainerColumnOnMobile>
              {!isReceiptState && (
                <>
                  <Spacer height={16} />
                  <MerchMintButton
                    onMintSuccess={handlePurchaseClick}
                    quantity={quantity}
                    tokenId={tokenId}
                  />
                </>
              )}
            </StyledPayAndPurchaseContainer>
          </StyledCheckoutBox>

          {isReceiptState && (
            <>
              <Spacer height={12} />
              <StyledPurchaseMoreButton
                onClick={() => {
                  setIsReceiptState(false);
                }}
              >
                Purchase More
              </StyledPurchaseMoreButton>
            </>
          )}
        </StyledCheckoutAndReceiptContainer>
      </StyledPurchaseBox>
    </>
  );
}

const StyledPurchaseBox = styled.div``;

const ExpandPurchaseButton = styled(Button)<{ show?: boolean; disabled?: boolean }>`
  align-self: flex-end;
  width: 100%;
  height: 100%;
  padding: 8px 24px;
  text-decoration: none;
  opacity: ${({ show }) => (show ? 1 : 0)};
  pointer-events: ${({ show }) => (show ? 'all' : 'none')};
  z-index: 1;
  transition: opacity 0ms ease-in-out;
  margin-bottom: 6px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  @media only screen and (max-width: 768px) {
    width: 176px;
    margin-bottom: 0;
  }
`;

const StyledCheckoutAndReceiptContainer = styled.div<{ showBox?: boolean }>`
  // This offsets the checkout box so it is on top of the expand purchase button (which is now hidden)
  margin-top: ${({ showBox }) => (showBox ? '-38px' : '0')};
  user-select: none;
`;

const StyledCheckoutBox = styled.div<{
  showBox: boolean;
  isReceiptState: boolean;
}>`
  z-index: 2;
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  max-height: 0;
  border: 1px solid transparent;
  padding: 16px;
  opacity: 0;
  border: 1px solid ${colors.porcelain};
  transition: max-height 400ms ease 0ms, transform 400ms ease 0ms, opacity 400ms ease 200ms;

  ${({ showBox }) =>
    showBox &&
    `max-height: 1000px;
    opacity: 1;
  `}

  pointer-events: ${({ isReceiptState }) => (isReceiptState ? 'none' : 'all')};

  @media screen and (max-width: 768px) {
    transition: max-height 400ms ease 0ms;
    height: auto;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100vw;
    background: white;
    pointer-events: none;

    ${({ showBox }) =>
      showBox &&
      `
      max-height: 1000px;
      pointer-events: all;
    `}

    // This shows the receipt text and box on mobile above the actual asset
    ${({ isReceiptState }) =>
      isReceiptState &&
      `position: fixed;
       top: 16px;
       height: auto;
       bottom: unset;
       left: 50%;
       transform: translateX(-50%);
       width: min(340px, 90vw);
       background: rgba(255,255,255,.5);
       backdrop-filter: blur(4px);
      `}
`;

const StyledCloseIcon = styled(DecoratedCloseIcon)`
  position: absolute;
  top: 0;
  right: 0;
  padding: 8px;
  background: white;
  display: block;
`;

const StyledCheckoutTitle = styled(TitleDiatypeL)`
  margin-bottom: 16px;
`;

const StyledCheckoutDescription = styled(BaseM)`
  margin-bottom: 16px;
`;

const StyledFlexContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  place-items: center;
`;

const StyledBaseM = styled(BaseM)`
  font-weight: bold;
`;

const StyledQuantityCounter = styled.div`
  display: flex;
  align-items: center;
`;

const StyledQuantity = styled(BaseM)`
  margin: 0 9px;
  min-width: 10px;
  text-align: center;
`;

const StyledColumnButton = styled.button<{ disabled: boolean }>`
  font-size: 16px;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  border: 0;
  padding: 0;
  background: none;

  path {
    stroke: ${({ disabled }) => (disabled ? `${colors.porcelain}` : 'auto')};
  }

  cursor: ${({ disabled }) => (disabled ? `default` : 'pointer')};
`;

const StyledPrice = styled(BaseXL)``;

const StyledPurchaseMoreButton = styled(Button)`
  width: 100%;
`;

const UserOwnsContainer = styled.div<{ inReceipt: boolean }>`
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
  border: 1px solid ${colors.porcelain};
  transition: opacity 300ms ease;
  z-index: 1;

  @media screen and (max-width: 768px) {
    position: fixed;
    bottom: unset;
    top: 10vh; // FIXME
    left: 50%;
    transform: translateX(-50%);
    width: min(340px, 90vw);
    height: auto;
    backdrop-filter: blur(3px);

    ${({ inReceipt }) =>
      inReceipt &&
      `position: relative;
      transform: none;
      width: auto;
      height: auto;
      top: unset;
      left: unset;
      margin: 0 -16px -24px;
      border: none;
  `}
`;

const StyledPageOverlay = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2;
  transition: opacity 300ms ease;
  opacity: ${({ show }) => (show ? 1 : 0)};
  pointer-events: ${({ show }) => (show ? 'all' : 'none')};
`;

const StyledPayAndPurchaseContainer = styled.div`
  @media only screen and (max-width: 768px) {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    row-gap: 12px;
  }
`;

const StyledFlexContainerColumnOnMobile = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  place-items: center;

  @media only screen and (max-width: 768px) {
    flex-direction: column;
    flex: 1;
    align-items: flex-start;
  }
`;

const StyledTapOutToClose = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
`;
