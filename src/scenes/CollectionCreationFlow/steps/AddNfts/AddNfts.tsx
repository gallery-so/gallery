import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import Sidebar from './Sidebar/Sidebar';
import Editor from './Editor';
import Directions from './Directions';
import { Nft } from 'types/Nft';

function useNftStager() {
  // TODO: might wanna lift this up to a context if we wanna avoid prop drilling
  const [stagedNfts, setStagedNfts] = useState<Nft[]>([]);

  const handleStageNft = useCallback((nft: Nft) => {
    setStagedNfts((prev) => [...prev, nft]);
  }, []);

  const handleUnstageNft = useCallback((id: string) => {
    setStagedNfts((prev) => prev.filter((nft) => nft.id !== id));
  }, []);

  return useMemo(
    () => ({
      stagedNfts,
      handleStageNft,
      handleUnstageNft,
    }),
    [stagedNfts, handleStageNft, handleUnstageNft]
  );
}

function AddNfts() {
  const { stagedNfts, handleStageNft, handleUnstageNft } = useNftStager();

  return (
    <StyledAddNfts>
      <SidebarContainer>
        <Sidebar onStageNft={handleStageNft} onUnstageNft={handleUnstageNft} />
      </SidebarContainer>
      <EditorContainer>
        {stagedNfts.length ? (
          <Editor stagedNfts={stagedNfts} />
        ) : (
          <Directions />
        )}
      </EditorContainer>
    </StyledAddNfts>
  );
}

const StyledAddNfts = styled.div`
  display: flex;
`;

const SIDEBAR_WIDTH = 280;

const SidebarContainer = styled.div`
  width: ${SIDEBAR_WIDTH}px;
`;

const EditorContainer = styled.div`
  width: calc(100vw - ${SIDEBAR_WIDTH}px);
`;

export default AddNfts;
