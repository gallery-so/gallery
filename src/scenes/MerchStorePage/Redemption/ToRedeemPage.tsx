import { Suspense, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import Loader from '~/components/core/Loader/Loader';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { useModalActions } from '~/contexts/modal/ModalContext';

import { MerchItemTypes } from '../MerchStorePage';
import RedeemItem from './RedeemItem';
import useUserOwnedMerch from './useUserOwnedMerch';
import useRedeemMerch from './useRedeemMerch';

type MerchItemTypesWithChecked = MerchItemTypes & { checked: boolean };

export default function ToRedeemPage() {
  const { userItems } = useUserOwnedMerch();
  const redeemMerch = useRedeemMerch();
  const [userItemsWithChecked, setUserItemsWithChecked] = useState<MerchItemTypesWithChecked[]>([]);
  const { hideModal } = useModalActions();

  useEffect(() => {
    setUserItemsWithChecked(userItems.map((item) => ({ ...item, checked: false })));
  }, [userItems]);

  const handleItemChange = (index: number, checked: boolean) => {
    userItemsWithChecked[index].checked = checked;
    setUserItemsWithChecked([...userItemsWithChecked]);
  };

  const handleSubmit = useCallback(() => {
    // Filter out items that are checked
    const itemsToRedeem = userItemsWithChecked.filter((item) => item.checked);

    // Get the item ids
    const itemIds = itemsToRedeem.map((item) => item.tokenId.toString());

    redeemMerch(itemIds);
  }, [redeemMerch, userItemsWithChecked]);

  const handleClose = useCallback(() => {
    hideModal();
  }, [hideModal]);

  return (
    <Suspense
      fallback={
        <StyledLoadingContainer grow justify="center" align="center">
          <Loader />
        </StyledLoadingContainer>
      }
    >
      {userItemsWithChecked.length > 0 ? (
        <>
          <StyledRedeemTextContainer>
            <BaseM>
              Mark the item you want to redeem, and we’ll generate a code that you can use on our
              Shopify store.
            </BaseM>
            <BaseM>You have not purchased any merchandise.</BaseM>
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
            <StyledRedeemSubmitButton onClick={handleSubmit}>Redeem</StyledRedeemSubmitButton>
          </StyledRedeemFooter>
        </>
      ) : (
        <>
          <StyledRedeemTextContainer>
            <BaseM>You have not purchased any merchandise.</BaseM>
          </StyledRedeemTextContainer>
          <StyledRedeemFooter>
            <StyledRedeemSubmitButton onClick={handleClose}>Close</StyledRedeemSubmitButton>
          </StyledRedeemFooter>
        </>
      )}
    </Suspense>
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

const StyledLoadingContainer = styled(VStack)`
  height: 250px;
`;
