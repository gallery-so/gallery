import styled from 'styled-components';
import { Button } from 'components/core/Button/Button';
import { useState, useCallback } from 'react';
import colors from 'components/core/colors';
import { BaseM, BaseXL, TitleDiatypeL } from 'components/core/Text/Text';
import HorizontalBreak from 'components/core/HorizontalBreak/HorizontalBreak';
import Spacer from 'components/core/Spacer/Spacer';

import CircleMinusIcon from 'src/icons/CircleMinusIcon';
import CirclePlusIcon from 'src/icons/CirclePlusIcon';

export default function PurchaseBox({ label, price }: { label: string; price: string }) {
  const [quantity, setQuantity] = useState(1);
  const [showBox, setShowBox] = useState(false);
  const [isReceiptState, setIsReceiptState] = useState(false);
  const [isPurchaseMoreState, setIsPurchaseMoreState] = useState(false);
  const [isAwaitingTransactionState, setIsAwaitingTransactionState] = useState(false);

  const toggleShowBox = useCallback(() => {
    setShowBox(true);
  }, []);

  const handlePurchaseClick = useCallback(() => {
    setIsAwaitingTransactionState(true);
    setTimeout(() => {
      setIsReceiptState(true);
      setIsAwaitingTransactionState(false);
    }, 1000);
  }, [setIsReceiptState]);

  return (
    <>
      <ExpandPurchaseButton onClick={toggleShowBox} show={!showBox}>
        Purchase
      </ExpandPurchaseButton>
      <StyledCheckoutAndReceiptContainer showBox={showBox}>
        {isPurchaseMoreState && (
          <>
            <ReceiptContainer>
              <StyledFlexContainer>
                <StyledBaseM>Quantity bought</StyledBaseM>
                <StyledBaseM>{quantity}</StyledBaseM>
              </StyledFlexContainer>
              <Spacer height={4} />
              <HorizontalBreak />
              <Spacer height={4} />
              <StyledFlexContainer>
                <StyledBaseM>{isReceiptState ? 'Total paid' : 'Pay today'}</StyledBaseM>
                <StyledPrice>{quantity * +price} Ξ</StyledPrice>
              </StyledFlexContainer>
            </ReceiptContainer>
            <Spacer height={8} />
          </>
        )}
        <StyledCheckoutBox
          showBox={showBox}
          isAwaitingTransactionState={isAwaitingTransactionState}
        >
          <StyledCheckoutTitle>
            {isReceiptState
              ? `You've bought ${quantity} ${quantity == 1 ? label : `${label}s`}.`
              : `Check Out NFT(s)`}
          </StyledCheckoutTitle>
          <StyledCheckoutDescription>
            {isReceiptState
              ? `You will be able to redeem the physical shirts in Fall 2023.`
              : `You are buying the NFT. Indicate the quantity you’d like to purchase, and you will be
            able to redeem the physical shirts in Fall 2023.`}
          </StyledCheckoutDescription>
          <StyledCheckoutDescription>
            Disclaimer: We cannot guarantee your size, as there is a limited quantity of each size.
          </StyledCheckoutDescription>
          <StyledFlexContainer>
            <StyledBaseM>{isReceiptState ? 'Quantity bought' : 'Quantity'}</StyledBaseM>
            <StyledQuantityCounter>
              <StyledColumnButton
                onClick={() => {
                  setQuantity(quantity - 1);
                }}
                disabled={quantity <= 1}
              >
                <CircleMinusIcon />
              </StyledColumnButton>
              <StyledQuantity>{quantity}</StyledQuantity>
              <StyledColumnButton
                onClick={() => {
                  setQuantity(quantity + 1);
                }}
                disabled={quantity >= 3}
              >
                <CirclePlusIcon />
              </StyledColumnButton>
            </StyledQuantityCounter>
          </StyledFlexContainer>
          <Spacer height={4} />
          <HorizontalBreak />
          <Spacer height={4} />
          <StyledFlexContainer>
            <StyledBaseM>{isReceiptState ? 'Total paid' : 'Pay today'}</StyledBaseM>
            <StyledPrice>{quantity * +price} Ξ</StyledPrice>
          </StyledFlexContainer>
          {!isReceiptState && (
            <>
              <Spacer height={16} />
              <StyledConfirmButton onClick={handlePurchaseClick}>
                Confirm Purchase
              </StyledConfirmButton>
            </>
          )}
        </StyledCheckoutBox>

        {/* FIXME: On success, show receipt text and render new button "Purchase More" */}
        {/* <MerchMintButton onMintSuccess={() => alert('Mint func goes here')}></MerchMintButton> */}
        {isReceiptState && (
          <>
            <Spacer height={12} />
            <StyledPurchaseMoreButton
              onClick={() => {
                setIsReceiptState(false);
                setIsPurchaseMoreState(true);
              }}
            >
              Purchase More
            </StyledPurchaseMoreButton>
          </>
        )}
      </StyledCheckoutAndReceiptContainer>
    </>
  );
}

const ExpandPurchaseButton = styled(Button)<{ show?: boolean }>`
  align-self: flex-end;
  width: 100%;
  height: 100%;
  padding: 8px 24px;
  text-decoration: none;
  opacity: ${({ show }) => (show ? 1 : 0)};
  pointer-events: ${({ show }) => (show ? 'all' : 'none')};
  z-index: 1;
  transition: opacity 0ms ease-in-out;
`;

const StyledCheckoutAndReceiptContainer = styled.div<{ showBox?: boolean }>`
  // This offsets the checkout box so it is on top of the expand purchase button (which is now hidden)
  margin-top: ${({ showBox }) => (showBox ? '-42px' : '0')};
`;

const StyledCheckoutBox = styled.div<{ showBox: boolean; isAwaitingTransactionState: boolean }>`
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
  ${({ showBox, isAwaitingTransactionState }) =>
    showBox &&
    `
    max-height: 1000px;
    opacity: ${isAwaitingTransactionState ? 0.5 : 1};
  `}
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
`;

const StyledColumnButton = styled.button<{ disabled: boolean }>`
  font-size: 16px;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  border: 0;
  padding: 0;
  cursor: pointer;
  background: none;

  path {
    stroke: ${({ disabled }) => (disabled ? `${colors.porcelain}` : 'auto')};
  }
`;

const StyledPrice = styled(BaseXL)``;

const StyledConfirmButton = styled(Button)``;
const StyledPurchaseMoreButton = styled(Button)`
  width: 100%;
`;

const ReceiptContainer = styled.div`
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
  border: 1px solid ${colors.porcelain};
  transition: opacity 300ms ease;
`;
