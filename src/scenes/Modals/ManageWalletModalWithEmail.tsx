import { useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeL, TitleDiatypeM } from '~/components/core/Text/Text';
import Toggle from '~/components/core/Toggle/Toggle';
import ManageWallets from '~/components/ManageWallets/ManageWallets';
import { ManageWalletsModalFragment$key } from '~/generated/ManageWalletsModalFragment.graphql';

type Props = {
  queryRef: ManageWalletsModalFragment$key;
  newAddress?: string;
  onEthAddWalletSuccess?: () => void;
  onTezosAddWalletSuccess?: () => void;
};

function ManageWalletsModalWithEmail({
  newAddress,
  queryRef,
  onEthAddWalletSuccess,
  onTezosAddWalletSuccess,
}: Props) {
  const query = useFragment(
    graphql`
      fragment ManageWalletsModalFragment on Query {
        ...ManageWalletsFragment
      }
    `,
    queryRef
  );

  // TODO: Replace with mutation
  const [isEmailNotificationChecked, setIsEmailNotificationChecked] = useState(false);
  const [isShowAddEmail, setIsShowAddEmail] = useState(false);

  const handleAddEmail = () => {
    setIsShowAddEmail(true);
  };

  return (
    <StyledManageWalletsModal gap={24}>
      <VStack gap={16}>
        <TitleDiatypeL>Never miss a moment</TitleDiatypeL>
        <VStack>
          <TitleDiatypeM>Email notifications</TitleDiatypeM>
          <HStack>
            <BaseM>
              Receive weekly recaps that show your most recent admires, comments, and followers.
            </BaseM>
            <Toggle checked={isEmailNotificationChecked} onChange={setIsEmailNotificationChecked} />
          </HStack>
        </VStack>
        <StyledButtonContaienr>
          {isShowAddEmail ? (
            <VStack gap={16}>
              <BaseM>Add email address content here</BaseM>
              <HStack align="center" justify="space-between">
                <Button variant="secondary" onClick={() => setIsShowAddEmail(false)}>
                  Cancel
                </Button>
                <Button variant="primary">Save</Button>
              </HStack>
            </VStack>
          ) : (
            <StyledButton variant="secondary" onClick={handleAddEmail}>
              add email address
            </StyledButton>
          )}
        </StyledButtonContaienr>
      </VStack>
      <StyledHr />
      <ManageWallets
        queryRef={query}
        newAddress={newAddress}
        onTezosAddWalletSuccess={onTezosAddWalletSuccess}
        onEthAddWalletSuccess={onEthAddWalletSuccess}
      />
    </StyledManageWalletsModal>
  );
}

const StyledManageWalletsModal = styled(VStack)`
  width: 300px;

  @media only screen and ${breakpoints.tablet} {
    width: 480px;
  }
`;

const StyledHr = styled.hr`
  width: 100%;
  border-top: 1px solid #e5e5e5;
  margin: 0;
`;

const StyledButtonContaienr = styled.div`
  display: inline;
`;

const StyledButton = styled(Button)`
  padding: 8px 12px;
`;

export default ManageWalletsModalWithEmail;
