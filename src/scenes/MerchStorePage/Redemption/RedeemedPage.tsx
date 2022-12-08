import { useCallback } from 'react';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import ArrowUpRightIcon from '~/icons/ArrowUpRightIcon';

import RedeemedItem from './RedeemedItem';

export default function RedeemedPage() {
  const handleRedeem = useCallback(() => {
    // TODO: Replace with the actual shopify link
    window.open('https://www.shopify.com', '_blank');
  }, []);

  return (
    <>
      <StyledRedeemTextContainer>
        <BaseM>Copy the codes to use on our Shopify shop.</BaseM>
      </StyledRedeemTextContainer>

      <RedeemedItem />
      <RedeemedItem />
      <RedeemedItem />

      <StyledRedeemFooter>
        <StyledRedeemSubmitButton onClick={handleRedeem}>
          <HStack gap={4} align="center">
            Redeem on shopify
            <ArrowUpRightIcon />
          </HStack>
        </StyledRedeemSubmitButton>
      </StyledRedeemFooter>
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
