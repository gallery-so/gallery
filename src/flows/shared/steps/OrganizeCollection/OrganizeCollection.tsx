import { useCallback, useEffect, useRef } from 'react';
import { WizardContext } from 'react-albus';

import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';
import CollectionEditorProvider, {
  useCollectionMetadataState,
  useStagedNftsState,
} from 'contexts/collectionEditor/CollectionEditorContext';
import { useModal } from 'contexts/modal/ModalContext';
import useUpdateCollectionNfts from 'hooks/api/collections/useUpdateCollectionNfts';
import {
  useCollectionWizardActions,
  useCollectionWizardState,
} from 'contexts/wizard/CollectionWizardContext';
import { useWizardId } from 'contexts/wizard/WizardDataProvider';
import Mixpanel from 'utils/mixpanel';
import { EditModeNft } from './types';
import CollectionEditor from './Editor/CollectionEditor';
import CollectionCreateOrEditForm from './CollectionCreateOrEditForm';

type ConfigProps = {
  push: WizardContext['push'];
};

function mapStagedNftsToNftIds(stagedNfts: EditModeNft[]) {
  return stagedNfts.map((stagedNft: EditModeNft) => stagedNft.nft.id);
}

function useWizardConfig({ push }: ConfigProps) {
  const { setOnNext, setOnPrevious } = useWizardCallback();
  const { showModal } = useModal();
  const stagedNfts = useStagedNftsState();
  const wizardId = useWizardId();

  const stagedNftIdsRef = useRef<string[]>([]);
  useEffect(() => {
    stagedNftIdsRef.current = mapStagedNftsToNftIds(stagedNfts);
  }, [stagedNfts]);

  const updateCollection = useUpdateCollectionNfts();
  const { collectionIdBeingEdited } = useCollectionWizardState();
  const { setCollectionIdBeingEdited } = useCollectionWizardActions();

  const collectionMetadata = useCollectionMetadataState();

  const goToOrganizeGalleryStep = useCallback(() => {
    // Clear selected collection when moving to next step
    setCollectionIdBeingEdited('');
    push('organizeGallery');
  }, [push, setCollectionIdBeingEdited]);

  useEffect(() => {
    // If collection is being edited, trigger update
    if (collectionIdBeingEdited) {
      setOnNext(async () => {
        // Errors will be handled in the catch block within `WizardFooter.tsx`
        await updateCollection(
          collectionIdBeingEdited,
          stagedNftIdsRef.current,
          collectionMetadata.layout
        );

        goToOrganizeGalleryStep();
      });

      setOnPrevious(goToOrganizeGalleryStep);
      return;
    }

    // If collection is being created, trigger creation
    setOnNext(async () => {
      Mixpanel.track('Save new collection');
      showModal(
        <CollectionCreateOrEditForm
          onNext={goToOrganizeGalleryStep}
          nftIds={stagedNftIdsRef.current}
          layout={collectionMetadata.layout}
        />
      );
    });

    // If user is editing their gallery, clicking "back" should bring them
    // back to the organize gallery view
    if (wizardId === 'edit-gallery') {
      setOnPrevious(goToOrganizeGalleryStep);
    }
  }, [
    collectionIdBeingEdited,
    goToOrganizeGalleryStep,
    setOnNext,
    setOnPrevious,
    showModal,
    updateCollection,
    wizardId,
    collectionMetadata,
  ]);
}

// In order to call `useWizardConfig`, component must be under `CollectionEditorProvider`
type DecoratedCollectionEditorProps = {
  push: WizardContext['push'];
};

function DecoratedCollectionEditor({ push }: DecoratedCollectionEditorProps) {
  useWizardConfig({ push });

  return <CollectionEditor />;
}

function OrganizeCollectionWithProvider({ push }: WizardContext) {
  return (
    <CollectionEditorProvider>
      <DecoratedCollectionEditor push={push} />
    </CollectionEditorProvider>
  );
}

export default OrganizeCollectionWithProvider;
