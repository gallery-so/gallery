import { useCallback, useEffect, useRef } from 'react';
import { WizardContext } from 'react-albus';

import CollectionCreateOrEditForm from './CollectionCreateOrEditForm';
import CollectionEditor from './Editor/CollectionEditor';

import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';
import CollectionEditorProvider, {
  useStagedNftsState,
} from 'contexts/collectionEditor/CollectionEditorContext';
import { useModal } from 'contexts/modal/ModalContext';
import { EditModeNft } from './types';
import useUpdateCollectionNfts from 'hooks/api/collections/useUpdateCollectionNfts';
import {
  useCollectionWizardActions,
  useCollectionWizardState,
} from 'contexts/wizard/CollectionWizardContext';

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

  const stagedNftIdsRef = useRef<string[]>([]);
  useEffect(() => {
    stagedNftIdsRef.current = mapStagedNftsToNftIds(stagedNfts);
  }, [stagedNfts]);

  const updateCollection = useUpdateCollectionNfts();
  const { collectionIdBeingEdited } = useCollectionWizardState();
  const { setCollectionIdBeingEdited } = useCollectionWizardActions();

  const goToOrganizeGalleryStep = useCallback(() => {
    // clear selected collection when moving to next step
    setCollectionIdBeingEdited('');
    push('organizeGallery');
  }, [push, setCollectionIdBeingEdited]);

  useEffect(() => {
    // if collection is being edited, trigger update
    if (collectionIdBeingEdited) {
      setOnNext(async () => {
        // errors will be handled in the catch block within `WizardFooter.tsx`
        await updateCollection(
          collectionIdBeingEdited,
          stagedNftIdsRef.current
        );

        goToOrganizeGalleryStep();
      });

      setOnPrevious(goToOrganizeGalleryStep);
      return;
    }

    // if collection is being created, trigger creation
    setOnNext(async () => {
      showModal(
        <CollectionCreateOrEditForm
          onNext={goToOrganizeGalleryStep}
          nftIds={stagedNftIdsRef.current}
        />
      );
    });
  }, [
    collectionIdBeingEdited,
    goToOrganizeGalleryStep,
    setOnNext,
    setOnPrevious,
    showModal,
    updateCollection,
  ]);
}

// in order to call `useWizardConfig`, component must be under `CollectionEditorProvider`
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
