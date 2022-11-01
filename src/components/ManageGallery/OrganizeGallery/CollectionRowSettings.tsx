import { useCallback } from 'react';
import styled from 'styled-components';

import TextButton from 'components/core/Button/TextButton';
import { useModalActions } from 'contexts/modal/ModalContext';
import useUpdateCollectionHidden from 'hooks/api/collections/useUpdateCollectionHidden';
import noop from 'utils/noop';
import CollectionCreateOrEditForm from '../OrganizeCollection/CollectionCreateOrEditForm';
import DeleteCollectionConfirmation from './DeleteCollectionConfirmation';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { graphql, useFragment } from 'react-relay';
import { CollectionRowSettingsFragment$key } from '__generated__/CollectionRowSettingsFragment.graphql';
import { HStack } from 'components/core/Spacer/Stack';
import SettingsDropdown from 'components/core/Dropdown/SettingsDropdown';
import { DropdownItem } from 'components/core/Dropdown/DropdownItem';
import { DropdownSection } from 'components/core/Dropdown/DropdownSection';

type Props = {
  collectionRef: CollectionRowSettingsFragment$key;
  onEditCollection: (dbid: string) => void;
};

function CollectionRowSettings({ collectionRef, onEditCollection }: Props) {
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

  const { dbid, name, collectorsNote, hidden, gallery } = collection;

  const track = useTrack();

  const handleEditCollectionClick = useCallback(() => {
    track('Update existing collection button clicked');

    onEditCollection(dbid);
  }, [dbid, onEditCollection, track]);

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
      headerText: 'Name and describe your collection',
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
    showModal({
      content: <DeleteCollectionConfirmation collectionRef={collection} />,
      headerText: 'Are you sure you want to delete your collection?',
    });
  }, [collection, showModal, track]);

  return (
    <SettingsContainer gap={8} align="center">
      <StyledTextButton onClick={handleEditCollectionClick} text="Edit" />
      <SettingsDropdown>
        <DropdownSection>
          <DropdownItem onClick={handleEditNameClick}>EDIT NAME & DESCRIPTION</DropdownItem>
          <DropdownItem onClick={handleToggleHiddenClick}>{hidden ? 'SHOW' : 'HIDE'}</DropdownItem>
          <DropdownItem onClick={handleDeleteClick}>DELETE</DropdownItem>
        </DropdownSection>
      </SettingsDropdown>
    </SettingsContainer>
  );
}

const SettingsContainer = styled(HStack)`
  position: absolute;

  right: 12px;
  top: 12px;
`;

const StyledTextButton = styled(TextButton)`
  height: 32px;
  width: 43px;
  border-radius: 1px;
  padding: 8px;
  font-weight: 500;
`;

export default CollectionRowSettings;
