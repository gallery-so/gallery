import { EditModeNft } from 'types/Nft';
import SortableStagedNft from './SortableStagedNft';
import UnstageButton from './UnstageButton';
import styled from 'styled-components';
import { StyledNftPreviewLabel } from 'components/NftPreview/NftPreviewLabel';

type Props = {
  editModeNft: EditModeNft;
};

function StagedNftWrapper({ editModeNft }: Props) {
  return (
    <StyledStageNftWrapper>
      <StyledUnstageButton
        // TODO make index guaranteed
        nftIndex={editModeNft.index || 0}
      />
      <SortableStagedNft nft={editModeNft.nft} />
    </StyledStageNftWrapper>
  );
}

// TODO: save this as a general transition under /core
const transitionStyle = `200ms cubic-bezier(0, 0, 0, 1.07)`;

const StyledUnstageButton = styled(UnstageButton)`
  opacity: 0;
  transition: opacity ${transitionStyle};
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
