import styled from 'styled-components';
import colors from 'components/core/colors';
import { Button } from 'components/core/Button/Button';
import { useCallback, useState } from 'react';
import { useModalActions } from 'contexts/modal/ModalContext';
import { useDeleteCollection } from 'hooks/api/collections/useDeleteCollection';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { graphql, useFragment } from 'react-relay';
import { DeleteCollectionConfirmationFragment$key } from '__generated__/DeleteCollectionConfirmationFragment.graphql';
import { HStack } from 'components/core/Spacer/Stack';

type Props = {
  collectionRef: DeleteCollectionConfirmationFragment$key;
};

function DeleteCollectionConfirmation({ collectionRef }: Props) {
  const { dbid: collectionId } = useFragment(
    graphql`
      fragment DeleteCollectionConfirmationFragment on Collection {
        dbid
      }
    `,
    collectionRef
  );

  const { hideModal } = useModalActions();
  const deleteCollection = useDeleteCollection();

  const [isLoading, setIsLoading] = useState(false);

  const track = useTrack();

  const handleConfirmClick = useCallback(async () => {
    setIsLoading(true);
    track('Delete collection', { id: collectionId });
    await deleteCollection(collectionId);
    setIsLoading(false);
    hideModal();
  }, [collectionId, deleteCollection, hideModal, track]);

  return (
    <StyledConfirmation>
      <HStack justify="flex-end">
        <StyledCancelButton onClick={() => hideModal()}>Cancel</StyledCancelButton>
        <StyledButton onClick={handleConfirmClick} disabled={isLoading} pending={isLoading}>
          Delete
        </StyledButton>
      </HStack>
    </StyledConfirmation>
  );
}

const StyledConfirmation = styled.div`
  width: 400px;
  max-width: 100%;
  padding-top: 16px;
`;

const StyledCancelButton = styled(Button).attrs({ variant: 'secondary' })`
  border: none;
  width: 80px;
  margin-right: 8px;
  color: ${colors.metal};
`;

const StyledButton = styled(Button)`
  width: 80px;
`;

export default DeleteCollectionConfirmation;
