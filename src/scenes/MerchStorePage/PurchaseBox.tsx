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

  const toggleShowBox = useCallback(() => {
    setShowBox(true);
  }, []);

  const handlePurchaseClick = useCallback(() => {
    setIsReceiptState(true);
  }, [setIsReceiptState]);

  return (
    <>
      {!showBox && <ExpandPurchaseButton onClick={toggleShowBox}>Purchase</ExpandPurchaseButton>}
      <>
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
            <Spacer height={2} />
          </>
        )}
        <StyledCheckoutBox showBox={showBox}>
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
      </>
    </>
  );
}

const ExpandPurchaseButton = styled(Button)`
  align-self: flex-end;
  width: 100%;
  height: 100%;
  padding: 8px 24px;
  text-decoration: none;
`;

const StyledCheckoutBox = styled.div<{ showBox: boolean }>`
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  max-height: 0;
  border: 1px solid transparent;
  transition: max-height 300ms ease, padding 0ms ease 300ms, border 0ms ease 300ms;

  ${({ showBox }) =>
    showBox &&
    `max-height: 1000px;
    padding:16px;
    transition: max-height 300ms ease, padding 0ms ease 0ms, border 0ms ease 0ms;
    border: 1px solid ${colors.porcelain}`}
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
const StyledPurchaseMoreButton = styled(Button)``;

const ReceiptContainer = styled.div`
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
  border: 1px solid ${colors.porcelain};
`;
