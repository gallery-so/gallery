import { useCallback } from 'react';
import styled from 'styled-components';

import Dropdown, { StyledDropdownButton } from 'components/core/Dropdown/Dropdown';
import TextButton from 'components/core/Button/TextButton';
import { useModal } from 'contexts/modal/ModalContext';
import Spacer from 'components/core/Spacer/Spacer';
import { withWizard, WizardComponentProps } from 'react-albus';
import { useCollectionWizardActions } from 'contexts/wizard/CollectionWizardContext';
import useUpdateCollectionHidden from 'hooks/api/collections/useUpdateCollectionHidden';
import { Collection } from 'types/Collection';
import noop from 'utils/noop';
import CollectionCreateOrEditForm from '../OrganizeCollection/CollectionCreateOrEditForm';
import DeleteCollectionConfirmation from './DeleteCollectionConfirmation';
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard';
import { useAuthenticatedUsername } from 'hooks/api/users/useUser';
import { useTrack } from 'contexts/analytics/AnalyticsContext';

type Props = {
  collection: Collection;
};

function CollectionRowSettings({ collection, wizard: { push } }: Props & WizardComponentProps) {
  const { showModal } = useModal();
  const { setCollectionIdBeingEdited } = useCollectionWizardActions();
  const username = useAuthenticatedUsername();

  const { id, name, collectors_note, hidden } = collection;

  const collectionUrl = `${window.location.origin}/${username}/${id}`;

  const track = useTrack();

  const handleEditCollectionClick = useCallback(() => {
    track('Update existing collection button clicked');
    setCollectionIdBeingEdited(id);
    push('organizeCollection');
  }, [id, push, setCollectionIdBeingEdited, track]);

  const handleEditNameClick = useCallback(() => {
    showModal(
      <CollectionCreateOrEditForm
        // No need for onNext because this isn't part of a wizard
        onNext={noop}
        collectionId={id}
        collectionName={name}
        collectionCollectorsNote={collectors_note}
      />
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
    track('Delete collection button clicked');
    showModal(<DeleteCollectionConfirmation collectionId={id} />);
  }, [id, showModal, track]);

  return (
    <StyledCollectionRowSettings>
      <Dropdown>
        <TextButton onClick={handleEditCollectionClick} text="Edit collection" />
        <Spacer height={12} />
        <TextButton onClick={handleEditNameClick} text="Edit name & description" />
        <Spacer height={12} />
        <TextButton onClick={handleToggleHiddenClick} text={hidden ? 'Show' : 'Hide'} />
        <Spacer height={12} />
        <CopyToClipboard textToCopy={collectionUrl}>
          <TextButton text="Share" />
        </CopyToClipboard>
        <Spacer height={12} />
        <TextButton onClick={handleDeleteClick} text="Delete" />
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
