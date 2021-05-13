import styled from 'styled-components';
import { Collection } from 'types/Collection';

import Dropdown, {
  StyledDropdownButton,
} from 'components/core/Dropdown/Dropdown';
import ActionText from 'components/core/ActionText/ActionText';
import { useCallback } from 'react';
import TextButton from 'components/core/Button/TextButton';
import CollectionNamingForm from '../OrganizeCollection/CollectionNamingForm';
import { useModal } from 'contexts/modal/ModalContext';
import DeleteCollectionConfirmation from './DeleteCollectionConfirmation';

type Props = {
  collection: Collection;
};

function CollectionRowSettings({ collection }: Props) {
  const { showModal } = useModal();
  const handleEditNameClick = useCallback(() => {
    showModal(
      <CollectionNamingForm onNext={() => {}} collection={collection} />
    );
  }, [collection, showModal]);

  const handleToggleHiddenClick = useCallback(() => {
    // make request to update collection
    // on success, update collection state
  }, []);

  const handleDeleteClick = useCallback(() => {
    showModal(<DeleteCollectionConfirmation></DeleteCollectionConfirmation>);
  }, [showModal]);

  return (
    <StyledCollectionRowSettings>
      <Dropdown>
        <StyledDropdownItem>
          <ActionText>Edit collection</ActionText>
        </StyledDropdownItem>
        <StyledDropdownItem>
          <TextButton
            onClick={handleEditNameClick}
            text="Edit name & description"
          ></TextButton>
        </StyledDropdownItem>
        <StyledDropdownItem>
          <TextButton
            onClick={handleToggleHiddenClick}
            text={collection.isHidden ? 'Show' : 'Hide'}
          ></TextButton>
        </StyledDropdownItem>
        <StyledDropdownItem>
          <TextButton onClick={handleDeleteClick} text="Delete"></TextButton>
        </StyledDropdownItem>
      </Dropdown>
    </StyledCollectionRowSettings>
  );
}

const StyledDropdownItem = styled.div`
  margin: 8px;
`;

const StyledCollectionRowSettings = styled.div`
  position: absolute;
  right: 24px;
  top: 28px;
  z-index: 1;

  ${StyledDropdownButton} {
    width: 32px;
    height: 24px;
  }
`;

export default CollectionRowSettings;
