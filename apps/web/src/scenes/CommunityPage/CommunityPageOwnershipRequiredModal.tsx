import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { CommunityPageOwnershipRequiredModalFragment$key } from '~/generated/CommunityPageOwnershipRequiredModalFragment.graphql';
import useSyncTokens from '~/hooks/api/tokens/useSyncTokens';
import { RefreshIcon } from '~/icons/RefreshIcon';

type Props = {
  communityRef: CommunityPageOwnershipRequiredModalFragment$key;
  refetchIsMemberOfCommunity: () => void;
};

export default function CommunityPageOwnershipRequiredModal({
  communityRef,
  refetchIsMemberOfCommunity,
}: Props) {
  const community = useFragment(
    graphql`
      fragment CommunityPageOwnershipRequiredModalFragment on Community {
        name
        chain
      }
    `,
    communityRef
  );

  const { hideModal } = useModalActions();
  const handleOkClick = useCallback(() => {
    hideModal();
  }, [hideModal]);
  const { isLocked, syncTokens } = useSyncTokens();

  // Acknowledgment: This could let a user refresh a chain they can't access in the Editor
  const handleRefreshCollectionClick = useCallback(async () => {
    if (!community.chain) {
      return;
    }

    await syncTokens({ type: 'Collected', chain: community.chain });
    refetchIsMemberOfCommunity();
    hideModal();
  }, [community.chain, hideModal, refetchIsMemberOfCommunity, syncTokens]);

  return (
    <StyledModal gap={16}>
      <BaseM>
        Only {community.name} owners can post about {community.name}. If you own this item but its
        not displaying try <strong>refreshing your collection</strong>.
      </BaseM>
      <HStack justify="flex-end" gap={8}>
        <Button variant="secondary" onClick={handleRefreshCollectionClick} disabled={isLocked}>
          <HStack align="center" gap={4}>
            <RefreshIcon />
            Refresh Collection
          </HStack>
        </Button>
        <Button variant="primary" onClick={handleOkClick}>
          OK
        </Button>
      </HStack>
    </StyledModal>
  );
}

const StyledModal = styled(VStack)`
  max-width: 375px;
`;
