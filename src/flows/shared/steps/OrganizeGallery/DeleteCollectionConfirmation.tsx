import styled from 'styled-components';
import { BodyMedium } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import Button from 'components/core/Button/Button';
import { useCallback, useState } from 'react';
import Spacer from 'components/core/Spacer/Spacer';
import { useModal } from 'contexts/modal/ModalContext';
import useDeleteCollection from 'hooks/api/collections/useDeleteCollection';
import { Collection } from 'types/Collection';
import Mixpanel from 'utils/mixpanel';

type Props = {
  collectionId: Collection['id'];
};

function DeleteCollectionConfirmation({ collectionId }: Props) {
  const { hideModal } = useModal();
  const deleteCollection = useDeleteCollection();

  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmClick = useCallback(async () => {
    setIsLoading(true);
    Mixpanel.track('Delete collection', {
      id: collectionId,
    });
    await deleteCollection(collectionId);
    setIsLoading(false);
    hideModal();
  }, [collectionId, deleteCollection, hideModal]);

  return (
    <StyledConfirmation>
      <BodyMedium>Are you sure you want to delete your collection?</BodyMedium>
      <Spacer height={48} />
      <ButtonContainer>
        <StyledCancelButton mini text="Nevermind" type="secondary" onClick={hideModal} />
        <StyledButton
          mini
          text="Delete"
          onClick={handleConfirmClick}
          disabled={isLoading}
          loading={isLoading}
        />
      </ButtonContainer>
    </StyledConfirmation>
  );
}

const StyledConfirmation = styled.div`
  width: 400px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const StyledCancelButton = styled(Button)`
  border: none;
  width: 125px;
  margin-right: 8px;
  color: ${colors.gray50};
`;

const StyledButton = styled(Button)`
  width: 125px;
`;

export default DeleteCollectionConfirmation;
