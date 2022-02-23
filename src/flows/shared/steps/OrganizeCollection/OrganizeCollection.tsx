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
import CollectionEditor from './Editor/CollectionEditor';
import CollectionCreateOrEditForm from './CollectionCreateOrEditForm';
import { Nft } from 'types/Nft';
import { getWhitespacePositionsFromStagedNfts } from 'utils/collectionLayout';

type ConfigProps = {
  push: WizardContext['push'];
};

function useWizardConfig({ push }: ConfigProps) {
  const { setOnNext, setOnPrevious } = useWizardCallback();
  const { showModal } = useModal();
  const wizardId = useWizardId();

  const stagedNfts = useStagedNftsState();
  const nftListToSave = useRef<Nft[]>([]);
  useEffect(() => {
    // remove whiteblocks from stagedNfts to create a list of nfts to save
    nftListToSave.current = stagedNfts.reduce((filtered: Nft[], { nft }) => {
      if (nft) {
        filtered.push(nft);
      }

      return filtered;
    }, []);
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
        // TODO: compute whitespace list
        const whitespaceList = getWhitespacePositionsFromStagedNfts(stagedNfts);
        // Errors will be handled in the catch block within `WizardFooter.tsx`
        try {
          await updateCollection(collectionIdBeingEdited, nftListToSave.current, {
            ...collectionMetadata.layout,
            whitespace: whitespaceList,
          });
        } catch {
          // TODO: display error toast here
        }

        goToOrganizeGalleryStep();
      });

      setOnPrevious(goToOrganizeGalleryStep);
      return;
    }

    // If collection is being created, trigger creation
    setOnNext(async () => {
      Mixpanel.track('Save new collection button clicked');
      showModal(
        <CollectionCreateOrEditForm
          onNext={goToOrganizeGalleryStep}
          nfts={nftListToSave.current}
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
    stagedNfts,
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
