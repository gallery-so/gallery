import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { BaseM } from '~/components/core/Text/Text';

import RedeemItem from './RedeemItem';
import useMerchRedemption from './useMerchRedemption';

export default function ToRedeemPage() {
  const { userItems } = useMerchRedemption();

  return (
    <>
      <StyledRedeemTextContainer>
        <BaseM>
          Mark the item you want to redeem, and we’ll generate a code that you can use on our
          Shopify store.
        </BaseM>
      </StyledRedeemTextContainer>
      {userItems.map((item, index) => (
        <RedeemItem key={index} name={`${item.title} ${item.label}`} checked={false} />
      ))}
      <StyledRedeemFooter>
        <StyledRedeemSubmitButton>Redeem</StyledRedeemSubmitButton>
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
`;
