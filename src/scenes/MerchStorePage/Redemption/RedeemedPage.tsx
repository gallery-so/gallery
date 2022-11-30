import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { BaseM } from '~/components/core/Text/Text';

import RedeemedItem from './RedeemedItem';

export default function RedeemedPage() {
  return (
    <>
      <StyledRedeemTextContainer>
        <BaseM>Copy the codes to use on our Shopify shop.</BaseM>
      </StyledRedeemTextContainer>

      <RedeemedItem />
      <RedeemedItem />
      <RedeemedItem />

      <StyledRedeemFooter>
        <StyledRedeemSubmitButton>Redeem on shopify</StyledRedeemSubmitButton>
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
