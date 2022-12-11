import { useCallback } from 'react';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { useModalActions } from '~/contexts/modal/ModalContext';
import ArrowUpRightIcon from '~/icons/ArrowUpRightIcon';

import RedeemedItem from './RedeemedItem';
import { MerchToken } from './RedeemModal';

type Props = {
  tokens: MerchToken[];
};

export default function RedeemedPage({ tokens }: Props) {
  const { hideModal } = useModalActions();

  const handleRedeem = useCallback(() => {
    // TODO: Replace with the actual shopify link
    window.open('https://www.shopify.com', '_blank');
  }, []);

  const handleClose = useCallback(() => {
    hideModal();
  }, [hideModal]);

  return (
    <>
      {tokens.length > 0 ? (
        <>
          <StyledRedeemTextContainer>
            <BaseM>Copy the codes to use on our Shopify shop.</BaseM>
          </StyledRedeemTextContainer>
          {tokens.map((token) => (
            <RedeemedItem
              key={token.tokenId}
              name={token.name || ''}
              discountCode={token.discountCode || ''}
            />
          ))}
          <StyledRedeemFooter>
            <StyledRedeemSubmitButton onClick={handleRedeem}>
              <HStack gap={4} align="center">
                Redeem on shopify
                <ArrowUpRightIcon />
              </HStack>
            </StyledRedeemSubmitButton>
          </StyledRedeemFooter>
        </>
      ) : (
        <>
          <BaseM>No items to redeem.</BaseM>
          <StyledRedeemFooter>
            <StyledRedeemSubmitButton onClick={handleClose}>
              <HStack gap={4} align="center">
                Close
              </HStack>
            </StyledRedeemSubmitButton>
          </StyledRedeemFooter>
        </>
      )}
    </>
  );
}

const StyledRedeemTextContainer = styled.div`
  padding-bottom: 16px;
`;

const StyledRedeemFooter = styled.div`
  padding: 12px 0;
`;

const StyledRedeemSubmitButton = styled(Button)`
  width: 100%;
  text-transform: uppercase;
`;
