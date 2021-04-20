import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import Sidebar from './Sidebar/Sidebar';
import Editor from './Editor';
import Directions from './Directions';
import { Nft } from 'types/Nft';

function useNftStaging() {
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
  const { stagedNfts, handleStageNft, handleUnstageNft } = useNftStaging();

  return (
    <StyledAddNfts>
      <Sidebar onStageNft={handleStageNft} onUnstageNft={handleUnstageNft} />
      {stagedNfts.length ? <Editor stagedNfts={stagedNfts} /> : <Directions />}
    </StyledAddNfts>
  );
}

const StyledAddNfts = styled.div`
  display: flex;
`;

export default AddNfts;
