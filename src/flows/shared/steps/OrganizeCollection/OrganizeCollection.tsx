import { useEffect, useRef } from 'react';
import { WizardContext } from 'react-albus';
import styled from 'styled-components';

import CollectionEditInfoForm from './CollectionEditInfoForm';
import CollectionEditor from './Editor/CollectionEditor';

import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';
import { useStagedNftsState } from 'contexts/collectionEditor/CollectionEditorContext';
import { useModal } from 'contexts/modal/ModalContext';
import { useWizardId } from 'contexts/wizard/WizardDataProvider';
import useFetcher from 'contexts/swr/useFetcher';
import { EditModeNft } from 'types/Nft';
import { CreateCollectionResponse } from 'types/Collection';

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

  const fetcher = useFetcher();

  useEffect(() => {
    // if the user is part of the onboarding flow, prompt them
    // to name their collection before moving onto the next step
    if (wizardId === 'onboarding') {
      setOnNext(async () => {
        // TODO: handle and display error in UI
        const createdCollection = await fetcher<CreateCollectionResponse>(
          '/collections/create',
          {
            nfts: stagedNftIdsRef.current,
          }
        );

        // TODO: Only need to show modal if this is creation
        showModal(
          <CollectionEditInfoForm
            onNext={onNext}
            collectionId={createdCollection.collection_id}
          />
        );
      });
    }

    // TODO: Create a collection outside of onboarding flow
    // TODO: Update an existing collection outside of onboarding flow
    // TODO: Differentiate between Create vs Update by looking at collection ID on CollectionEditorContext

    return () => setOnNext(undefined);
  }, [setOnNext, showModal, onNext, wizardId, fetcher]);
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
