import { useCallback, useEffect } from 'react';
import { WizardContext } from 'react-albus';
import styled from 'styled-components';

import CollectionNamingForm from './CollectionNamingForm';
import CollectionEditor from './Editor/CollectionEditor';

import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';
import { useStagedNftsState } from 'contexts/collectionEditor/CollectionEditorContext';
import { useModal } from 'contexts/modal/ModalContext';
import { useWizardId } from 'contexts/wizard/WizardDataProvider';
import fetcher from 'contexts/swr/fetcher';
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

  const getStagedNfts = useCallback(() => stagedNfts, [stagedNfts]);

  useEffect(() => {
    // if the user is part of the onboarding flow, prompt them
    // to name their collection before moving onto the next step
    if (wizardId === 'onboarding') {
      setOnNext(async () => {
        let nftIdsToSave = mapStagedNftsToNftIds(getStagedNfts());

        const createdCollection = await fetcher<CreateCollectionResponse>(
          '/collections/create',
          {
            nfts: nftIdsToSave,
          }
        );

        showModal(
          <CollectionNamingForm
            onNext={onNext}
            // TODO: pass in only id, or actual collection
            collection={{ id: createdCollection.collection_id, nfts: [] }}
          />
        );
      });
    }

    return () => setOnNext(undefined);
  }, [setOnNext, showModal, onNext, wizardId, getStagedNfts]);
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
