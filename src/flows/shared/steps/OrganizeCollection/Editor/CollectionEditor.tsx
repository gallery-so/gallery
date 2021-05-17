import { useEffect } from 'react';
import styled from 'styled-components';

import Sidebar from '../Sidebar/Sidebar';
import StagingArea from './StagingArea';
import Directions from '../Directions';

import {
  useCollectionEditorActions,
  useStagedNftsState,
} from 'contexts/collectionEditor/CollectionEditorContext';
import { useWizardValidationActions } from 'contexts/wizard/WizardValidationContext';
import { useCollectionWizardState } from 'contexts/wizard/CollectionWizardContext';
import { ANIMATION_NFT, AUDIO_NFT, IMAGE_NFT, VIDEO_NFT } from 'mocks/nfts';
import { EditModeNft } from 'types/Nft';
import { Collection } from 'types/Collection';

const MOCKED_AVAILABLE_NFTS = [IMAGE_NFT, VIDEO_NFT];
const MOCKED_EXISTING_COLLECTION: Collection = {
  id: '123',
  nfts: [AUDIO_NFT, ANIMATION_NFT],
};

function CollectionEditor() {
  const stagedNfts = useStagedNftsState();
  const { setNextEnabled } = useWizardValidationActions();

  useEffect(() => {
    setNextEnabled(stagedNfts.length > 0);

    return () => setNextEnabled(true);
  }, [setNextEnabled, stagedNfts]);

  const { collectionIdBeingEdited } = useCollectionWizardState();
  const { setAllNfts, stageNfts } = useCollectionEditorActions();

  // initialize allNfts
  useEffect(() => {
    const availableNfts: EditModeNft[] = MOCKED_AVAILABLE_NFTS.map(
      (nft, index) => ({
        index,
        nft,
        id: nft.id,
      })
    );

    // 1. retrieve all nfts from SWR
    // 2. turn Nfts into EditModeNfts
    // If creating a new collection (collectionIdBeingEdited is not defined):
    //   Set all nfts on CollectionEditorContext state
    // If editing an existing collection (collectionIdBeingEdited is defined):
    //   1. retrieve currently edited collection
    //   2. turn Nfts in collection into EditModeNfts
    //   3. For each nft in collection, mark the nft as isSelected in all nfts
    //   4. Set all nfts and staged nfts on CollectionEditorContext state
    if (collectionIdBeingEdited) {
      // EDITING COLLECTION
      const existingCollection: EditModeNft[] = MOCKED_EXISTING_COLLECTION.nfts.map(
        (nft, index) => ({
          index: index,
          nft,
          id: nft.id,
          isSelected: true,
        })
      );
      const allNfts = existingCollection.concat(availableNfts);
      // what is the most performant way of
      // marking each nft in allNfts that is in existingCollection as isSelected = true
      // it would be easiest if allNfts is every nft not in a collection
      // that way we can just append existingCollection to allNfts

      // rename to sidebarNftsIndex? to make it clear what index
      allNfts.forEach((nft, index) => {
        nft.index = index;
      });
      setAllNfts(allNfts);
      stageNfts(existingCollection);
      return;
    }
    // NEW COLLECTION
    setAllNfts(availableNfts);
  }, [collectionIdBeingEdited, setAllNfts, stageNfts]);

  return (
    <>
      <StyledSidebarContainer>
        <Sidebar />
      </StyledSidebarContainer>
      <StyledEditorContainer>
        {stagedNfts.length ? <StagingArea /> : <Directions />}
      </StyledEditorContainer>
    </>
  );
}
const SIDEBAR_WIDTH = 280;

const StyledSidebarContainer = styled.div`
  width: ${SIDEBAR_WIDTH}px;
`;

const StyledEditorContainer = styled.div`
  width: calc(100vw - ${SIDEBAR_WIDTH}px);
`;

export default CollectionEditor;
