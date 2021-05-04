import { Nft } from 'types/Nft';
import SortableStagedNft from './SortableStagedNft';
import UnstageButton from './UnstageButton';
import styled from 'styled-components';
import { StyledNftPreviewLabel } from 'components/NftPreview/NftPreviewLabel';

type Props = {
  nft: Nft;
  activeId?: string;
};

function StagedNftWrapper({ nft, activeId }: Props) {
  return (
    <StyledStageNftWrapper>
      <StyledUnstageButton
        // TODO make index guaranteed
        nftIndex={nft.index || 0}
      />
      <SortableStagedNft nft={nft} activeId={activeId} />
    </StyledStageNftWrapper>
  );
}

const StyledUnstageButton = styled(UnstageButton)`
  opacity: 0;
  transition: opacity 200ms;
`;

const StyledStageNftWrapper = styled.div`
  position: relative;

  &:hover ${StyledUnstageButton} {
    opacity: 1;
  }

  &:hover ${StyledNftPreviewLabel} {
    opacity: 1;
  }
`;

export default StagedNftWrapper;
