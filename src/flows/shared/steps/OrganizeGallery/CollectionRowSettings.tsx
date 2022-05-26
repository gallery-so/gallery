import { useCallback } from 'react';
import styled from 'styled-components';

import Dropdown, { StyledDropdownButton } from 'components/core/Dropdown/Dropdown';
import TextButton from 'components/core/Button/TextButton';
import { useModalActions } from 'contexts/modal/ModalContext';
import Spacer from 'components/core/Spacer/Spacer';
import { withWizard, WizardComponentProps } from 'react-albus';
import { useCollectionWizardActions } from 'contexts/wizard/CollectionWizardContext';
import useUpdateCollectionHidden from 'hooks/api/collections/useUpdateCollectionHidden';
import noop from 'utils/noop';
import CollectionCreateOrEditForm from '../OrganizeCollection/CollectionCreateOrEditForm';
import DeleteCollectionConfirmation from './DeleteCollectionConfirmation';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { graphql, useFragment } from 'react-relay';
import { CollectionRowSettingsFragment$key } from '__generated__/CollectionRowSettingsFragment.graphql';

type Props = {
  collectionRef: CollectionRowSettingsFragment$key;
};

function CollectionRowSettings({ collectionRef, wizard: { push } }: Props & WizardComponentProps) {
  const collection = useFragment(
    graphql`
      fragment CollectionRowSettingsFragment on Collection {
        dbid
        name
        collectorsNote
        hidden
        gallery @required(action: THROW) {
          dbid @required(action: THROW)
        }
        ...DeleteCollectionConfirmationFragment
      }
    `,
    collectionRef
  );

  const { showModal } = useModalActions();
  const { setCollectionIdBeingEdited } = useCollectionWizardActions();

  const { dbid, name, collectorsNote, hidden, gallery } = collection;

  const track = useTrack();

  const handleEditCollectionClick = useCallback(() => {
    track('Update existing collection button clicked');
    setCollectionIdBeingEdited(dbid);
    push('organizeCollection');
  }, [dbid, push, setCollectionIdBeingEdited, track]);

  const handleEditNameClick = useCallback(() => {
    showModal({
      content: (
        <CollectionCreateOrEditForm
          // No need for onNext because this isn't part of a wizard
          onNext={noop}
          galleryId={gallery.dbid}
          collectionId={dbid}
          collectionName={name ?? ''}
          collectionCollectorsNote={collectorsNote ?? ''}
        />
      ),
    });
  }, [collectorsNote, dbid, gallery.dbid, name, showModal]);

  const toggleHideCollection = useUpdateCollectionHidden();

  const handleToggleHiddenClick = useCallback(() => {
    toggleHideCollection(dbid, !hidden).catch((error: unknown) => {
      // TODO handle toggle hide error
      throw error;
    });
  }, [dbid, hidden, toggleHideCollection]);

  const handleDeleteClick = useCallback(() => {
    track('Delete collection button clicked');
    showModal({ content: <DeleteCollectionConfirmation collectionRef={collection} /> });
  }, [collection, showModal, track]);

  return (
    <StyledCollectionRowSettings>
      <Dropdown>
        <TextButton onClick={handleEditCollectionClick} text="Edit collection" />
        <Spacer height={12} />
        <TextButton onClick={handleEditNameClick} text="Edit name & description" />
        <Spacer height={12} />
        <TextButton onClick={handleToggleHiddenClick} text={hidden ? 'Show' : 'Hide'} />
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
