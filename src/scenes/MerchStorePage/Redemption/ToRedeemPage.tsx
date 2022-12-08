import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { BaseM } from '~/components/core/Text/Text';

import { MerchItemTypes } from '../MerchStorePage';
import RedeemItem from './RedeemItem';
import useMerchRedemption from './useMerchRedemption';

type MerchItemTypesWithChecked = MerchItemTypes & { checked: boolean };

export default function ToRedeemPage() {
  const { userItems } = useMerchRedemption();
  const [userItemsWithChecked, setUserItemsWithChecked] = useState<MerchItemTypesWithChecked[]>([]);

  useEffect(() => {
    setUserItemsWithChecked(userItems.map((item) => ({ ...item, checked: false })));
  }, [userItems]);

  const handleItemChange = (index: number, checked: boolean) => {
    userItemsWithChecked[index].checked = checked;
    setUserItemsWithChecked([...userItemsWithChecked]);
  };

  return (
    <>
      <StyledRedeemTextContainer>
        <BaseM>
          Mark the item you want to redeem, and we’ll generate a code that you can use on our
          Shopify store.
        </BaseM>
      </StyledRedeemTextContainer>
      {userItemsWithChecked.map((item, index) => (
        <RedeemItem
          key={index}
          index={index}
          name={`${item.title} ${item.label}`}
          checked={item.checked}
          onChange={handleItemChange}
        />
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
