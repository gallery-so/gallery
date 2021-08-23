import { useCallback, useEffect, useRef } from 'react';
import { WizardContext } from 'react-albus';

import CollectionEditInfoForm from './CollectionEditInfoForm';
import CollectionEditor from './Editor/CollectionEditor';

import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';
import CollectionEditorProvider, {
  useStagedNftsState,
} from 'contexts/collectionEditor/CollectionEditorContext';
import { useModal } from 'contexts/modal/ModalContext';
import useCreateCollection from 'hooks/api/collections/useCreateCollection';
import { EditModeNft } from './types';
import useAuthenticatedGallery from 'hooks/api/galleries/useAuthenticatedGallery';
import useUpdateCollectionNfts from 'hooks/api/collections/useUpdateCollectionNfts';
import { useCollectionWizardState } from 'contexts/wizard/CollectionWizardContext';

type ConfigProps = {
  onNext: WizardContext['next'];
};

function mapStagedNftsToNftIds(stagedNfts: EditModeNft[]) {
  return stagedNfts.map((stagedNft: EditModeNft) => stagedNft.nft.id);
}

function useWizardConfig({ onNext }: ConfigProps) {
  const { setOnNext } = useWizardCallback();
  const { showModal } = useModal();
  const stagedNfts = useStagedNftsState();

  const stagedNftIdsRef = useRef<string[]>([]);
  useEffect(() => {
    stagedNftIdsRef.current = mapStagedNftsToNftIds(stagedNfts);
  }, [stagedNfts]);

  const { id: galleryId } = useAuthenticatedGallery();
  const createCollection = useCreateCollection();
  const updateCollection = useUpdateCollectionNfts();
  const { collectionIdBeingEdited } = useCollectionWizardState();

  useEffect(() => {
    // if collection is being edited, trigger update
    if (collectionIdBeingEdited) {
      setOnNext(async () => {
        // errors will be handled in the catch block within `WizardFooter.tsx`
        await updateCollection(
          collectionIdBeingEdited,
          stagedNftIdsRef.current
        );
      });

      return;
    }

    // if collection is being created, trigger creation
    setOnNext(async () => {
      // errors will be handled in the catch block within `WizardFooter.tsx`
      const createdCollection = await createCollection(
        galleryId,
        stagedNftIdsRef.current
      );

      showModal(
        <CollectionEditInfoForm
          onNext={onNext}
          collectionId={createdCollection.collection_id}
        />
      );
    });
  }, [
    setOnNext,
    showModal,
    onNext,
    createCollection,
    galleryId,
    updateCollection,
    collectionIdBeingEdited,
  ]);
}

// in order to call `useWizardConfig`, component must be under `CollectionEditorProvider`
type DecoratedCollectionEditorProps = {
  push: WizardContext['push'];
};

function DecoratedCollectionEditor({ push }: DecoratedCollectionEditorProps) {
  const onNext = useCallback(() => {
    push('organizeGallery');
  }, [push]);

  useWizardConfig({ onNext });

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
