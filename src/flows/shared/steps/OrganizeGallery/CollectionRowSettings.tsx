import { useCallback } from 'react';
import styled from 'styled-components';

import Dropdown, {
  StyledDropdownButton,
} from 'components/core/Dropdown/Dropdown';
import TextButton from 'components/core/Button/TextButton';
import { useModal } from 'contexts/modal/ModalContext';
import Spacer from 'components/core/Spacer/Spacer';
import { withWizard, WizardComponentProps } from 'react-albus';
import { useCollectionWizardActions } from 'contexts/wizard/CollectionWizardContext';
import useUpdateCollectionHidden from 'hooks/api/collections/useUpdateCollectionHidden';
import { Collection } from 'types/Collection';
import Mixpanel from 'utils/mixpanel';
import noop from 'utils/noop';
import CollectionCreateOrEditForm from '../OrganizeCollection/CollectionCreateOrEditForm';
import DeleteCollectionConfirmation from './DeleteCollectionConfirmation';

type Props = {
  collection: Collection;
};

function CollectionRowSettings({
  collection,
  wizard: { push },
}: Props & WizardComponentProps) {
  const { showModal } = useModal();
  const { setCollectionIdBeingEdited } = useCollectionWizardActions();

  const { id, name, collectors_note, hidden } = collection;

  const handleEditCollectionClick = useCallback(() => {
    Mixpanel.track('Update existing collection');
    setCollectionIdBeingEdited(id);
    push('organizeCollection');
  }, [id, push, setCollectionIdBeingEdited]);

  const handleEditNameClick = useCallback(() => {
    showModal(
      <CollectionCreateOrEditForm
        // No need for onNext because this isn't part of a wizard
        onNext={noop}
        collectionId={id}
        collectionName={name}
        collectionCollectorsNote={collectors_note}
      />,
    );
  }, [collectors_note, id, name, showModal]);

  const toggleHideCollection = useUpdateCollectionHidden();

  const handleToggleHiddenClick = useCallback(() => {
    toggleHideCollection(id, !hidden).catch((error: unknown) => {
      // TODO handle toggle hide error
      throw error;
    });
  }, [id, hidden, toggleHideCollection]);

  const handleDeleteClick = useCallback(() => {
    showModal(<DeleteCollectionConfirmation collectionId={id} />);
  }, [id, showModal]);

  return (
    <StyledCollectionRowSettings>
      <Dropdown>
        <TextButton
          onClick={handleEditCollectionClick}
          text="Edit collection"
          underlineOnHover
        />
        <Spacer height={12} />
        <TextButton
          onClick={handleEditNameClick}
          text="Edit name & description"
          underlineOnHover
        />
        <Spacer height={12} />
        <TextButton
          onClick={handleToggleHiddenClick}
          text={hidden ? 'Show' : 'Hide'}
          underlineOnHover
        />
        <Spacer height={12} />
        <TextButton
          onClick={handleDeleteClick}
          text="Delete"
          underlineOnHover
        />
      </Dropdown>
    </StyledCollectionRowSettings>
  );
}

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

export default withWizard(CollectionRowSettings);
