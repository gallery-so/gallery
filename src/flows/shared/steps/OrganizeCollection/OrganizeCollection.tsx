import { useEffect, useRef } from 'react';
import { WizardContext } from 'react-albus';
import styled from 'styled-components';

import CollectionEditInfoForm from './CollectionEditInfoForm';
import CollectionEditor from './Editor/CollectionEditor';

import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';
import { useStagedNftsState } from 'contexts/collectionEditor/CollectionEditorContext';
import { useModal } from 'contexts/modal/ModalContext';
import { useWizardId } from 'contexts/wizard/WizardDataProvider';
import useCreateCollection from 'hooks/api/collections/useCreateCollection';
import { EditModeNft } from './types';
import useGalleryId from 'hooks/api/galleries/useGalleryId';

type ConfigProps = {
  onNext: WizardContext['next'];
};

type Props = {
  next?: any;
};

function mapStagedNftsToNftIds(stagedNfts: EditModeNft[]) {
  return stagedNfts.map((stagedNft: EditModeNft) => stagedNft.nft.id);
}

function useWizardConfig({ onNext }: ConfigProps) {
  const wizardId = useWizardId();
  const { setOnNext } = useWizardCallback();
  const { showModal } = useModal();
  const stagedNfts = useStagedNftsState();

  const stagedNftIdsRef = useRef<string[]>([]);
  useEffect(() => {
    stagedNftIdsRef.current = mapStagedNftsToNftIds(stagedNfts);
  }, [stagedNfts]);

  const galleryId = useGalleryId();

  const createCollection = useCreateCollection();

  useEffect(() => {
    // if the user is part of the onboarding flow, they should
    // CREATE their collection
    if (wizardId === 'onboarding') {
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
    }

    if (wizardId === 'edit-gallery') {
      setOnNext(async () => {
        // TODO__v1!!! make this use update collection
        await createCollection(galleryId, stagedNftIdsRef.current);
      });
    }

    return () => setOnNext(undefined);
  }, [setOnNext, showModal, onNext, wizardId, createCollection, galleryId]);
}

function OrganizeCollection({ next }: Props) {
  useWizardConfig({ onNext: next });

  return (
    <StyledOrganizeCollection>
      <CollectionEditor />
    </StyledOrganizeCollection>
  );
}

const StyledOrganizeCollection = styled.div`
  display: flex;
`;

export default OrganizeCollection;
