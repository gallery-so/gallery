import styled from 'styled-components';
import { Button } from 'components/core/Button/Button';
import { useCallback } from 'react';
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
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
import { ethers } from 'ethers';
import { DecoratedCloseIcon } from 'src/icons/CloseIcon';
import transitions from 'components/core/transitions';

export function UserOwnsBox({ inReceipt, tokenId }: { inReceipt: boolean; tokenId: number }) {
  const contract = useMintMerchContract();

  const { tokenPrice, userOwnedSupply } = useMintContractWithQuantity({
    contract,
    tokenId,
  });

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

export function MobileReceiptBox({
  tokenId,
  quantity,
  label,
  setIsReceiptState,
  setShowBox,
}: {
  tokenId: number;
  quantity: number;
  label: string;
  setIsReceiptState: (isReceiptState: boolean) => void;
  setShowBox: (showBox: boolean) => void;
}) {
  return (
    <>
      <StyledMobileReceipt>
        <StyledCloseIcon
          onClick={() => {
            setIsReceiptState(false);
            setShowBox(false);
          }}
        />
        <StyledCheckoutTitle>
          You've bought {quantity} {quantity == 1 ? label : `${label}s`}
        </StyledCheckoutTitle>
        <StyledCheckoutDescription>
          You will be able to redeem the physical {label.toLowerCase()} in Fall 2022.
        </StyledCheckoutDescription>
        {label === 'Shirt' && (
          <StyledCheckoutDescription>
            Disclaimer: We cannot guarantee your size, as there is a limited quantity of each size.
          </StyledCheckoutDescription>
        )}
        <UserOwnsBox inReceipt={true} tokenId={tokenId} />
      </StyledMobileReceipt>
      {quantity === MAX_NFTS_PER_WALLET && (
        <>
          <Spacer height={12} />
          <StyledOwnMaxText>
            You’ve reached the limit of 3 {label}s per collector, and you will not be able to buy
            any more.
          </StyledOwnMaxText>
        </>
      )}
    </>
  );
}

export default function PurchaseBox({
  label,
  tokenId,
  disabled,
  quantity,
  setQuantity,
  isReceiptState,
  setIsReceiptState,
  showBox,
  setShowBox,
}: {
  label: string;
  tokenId: number;
  disabled: boolean;
  quantity: number;
  setQuantity: (quantity: number) => void;
  isReceiptState: boolean;
  setIsReceiptState: (isReceiptState: boolean) => void;
  showBox: boolean;
  setShowBox: (showBox: boolean) => void;
}) {
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const contract = useMintMerchContract();

  const { soldOut, userOwnedSupply, active, tokenPrice } = useMintContractWithQuantity({
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
  }, [disabled, setShowBox]);

  const handlePurchaseClick = useCallback(() => {
    setIsReceiptState(true);
  }, [setIsReceiptState]);

  return (
    <>
      {/* {isMobile && (showBox || isReceiptState) && (
        <StyledTapOutToClose
          onClick={() => {
            setShowBox(false);
            setIsReceiptState(false);
          }}
        />
      )} */}

      <StyledPurchaseBox>
        {isMobile && (
          <StyledPageOverlay onClick={() => setShowBox(false)} show={showBox && !isReceiptState} />
        )}

        {!soldOut && (
          <ExpandPurchaseButton onClick={toggleShowBox} show={!showBox} disabled={disabled}>
            Purchase
          </ExpandPurchaseButton>
        )}

        <StyledCheckoutAndReceiptContainer showBox={showBox}>
          {userOwnedSupply > 0 && !isMobile && <UserOwnsBox inReceipt={false} tokenId={tokenId} />}
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
                ? `You will be able to redeem the physical ${label?.toLowerCase()} in Fall 2022.`
                : `You are buying the NFT. Indicate the quantity you’d like to purchase, and you will be
            able to redeem the physical ${label?.toLowerCase()}s in Fall 2022. Shipping will be calculated separately at redemption.`}
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
              {userOwnedSupply === MAX_NFTS_PER_WALLET ? (
                <StyledOwnMaxText>
                  You’ve reached the limit of 3 {label}s per collector, and you will not be able to
                  buy any more.
                </StyledOwnMaxText>
              ) : (
                <StyledPurchaseMoreButton
                  onClick={() => {
                    setIsReceiptState(false);
                  }}
                >
                  Purchase More
                </StyledPurchaseMoreButton>
              )}
            </>
          )}
        </StyledCheckoutAndReceiptContainer>

        {soldOut && (
          <StyledSoldOutContainer>
            <TitleDiatypeL>Sold out</TitleDiatypeL>
          </StyledSoldOutContainer>
        )}
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
  // width: 176px;
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
  padding-top: ${({ showBox }) => (showBox ? 16 : 0)}px;
  padding-bottom: ${({ showBox }) => (showBox ? 16 : 0)}px;
  padding-left: 16px;
  padding-right: 16px;
  opacity: 0;
  border: 1px solid ${colors.porcelain};
  transition: ${transitions.cubic};

  ${({ showBox }) =>
    showBox &&
    `max-height: 1000px;
    opacity: 1;
  `}

  pointer-events: ${({ isReceiptState }) => (isReceiptState ? 'none' : 'all')};

  @media screen and (max-width: 768px) {
    transition: max-height ${transitions.cubic};
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

    ${({ isReceiptState }) =>
      isReceiptState &&
      `
      display: none;
       `}
`;

const StyledMobileReceipt = styled.div`
  z-index: 2;
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border: 1px solid transparent;
  padding: 16px;
  border: 1px solid ${colors.porcelain};
  transition: ${transitions.cubic};
  position: relative;
  width: min(340px, 90vw);
  margin-top: 5vh;
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
  transition: opacity ${transitions.cubic};
  z-index: 1;

  @media screen and (max-width: 768px) {
    margin-top: 5vh;
    width: min(340px, 90vw);
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
  transition: opacity ${transitions.cubic};
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

// const StyledTapOutToClose = styled.div`
//   position: fixed;
//   top: 0;
//   left: 0;
//   width: 100%;
//   height: 100%;
//   opacity: 0;
// `;

const StyledSoldOutContainer = styled.div`
  text-align: center;
`;

const StyledOwnMaxText = styled(BaseM)`
  //styleName: Base ∙ 14|20 ∙ M;
  font-family: ABC Diatype;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: 0px;
  text-align: left;
  color: ${colors.metal};

  @media screen and (max-width: 768px) {
    width: min(340px, 90vw);
  }
`;
