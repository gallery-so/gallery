import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { BaseM } from '~/components/core/Text/Text';

import RedeemItem from './RedeemItem';

// TODO: replace with real data
const items = [
  {
    id: 1,
    name: '(OBJECT 001) Shirt',
    checked: false,
  },
  {
    id: 2,
    name: '(OBJECT 001) Shirt',
    checked: false,
  },
  {
    id: 3,
    name: '(OBJECT 002) hat',
    checked: false,
  },
  {
    id: 4,
    name: '(OBJECT 003) card',
    checked: false,
  },
];

export default function ToRedeemPage() {
  return (
    <>
      <StyledRedeemTextContainer>
        <BaseM>
          Mark the item you want to redeem, and we’ll generate a code that you can use on our
          Shopify store.
        </BaseM>
      </StyledRedeemTextContainer>
      {items.map((item) => (
        <RedeemItem key={item.id} name={item.name} checked={item.checked} />
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
