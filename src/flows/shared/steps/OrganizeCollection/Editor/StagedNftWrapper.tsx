import { EditModeNft } from 'types/Nft';
import styled from 'styled-components';
import { StyledNftPreviewLabel } from 'components/NftPreview/NftPreviewLabel';
import Gradient from 'components/core/Gradient/Gradient';
import SortableStagedNft from './SortableStagedNft';
import UnstageButton from './UnstageButton';
import transitions from 'components/core/transitions';

type Props = {
  editModeNft: EditModeNft;
};

function StagedNftWrapper({ editModeNft }: Props) {
  return (
    <StyledStageNftWrapper>
      <StyledGradient type="top" />
      <StyledUnstageButton
        nftId={editModeNft.id}
        nftIndex={editModeNft.index}
      />
      <SortableStagedNft nft={editModeNft.nft} />
      <StyledGradient type="bottom" direction="down" />
    </StyledStageNftWrapper>
  );
}

const StyledGradient = styled(Gradient)<{ type: 'top' | 'bottom' }>`
  position: absolute;
  ${({ type }) => type}: 0;

  opacity: 0;
  transition: opacity ${transitions.cubic};
`;

const StyledUnstageButton = styled(UnstageButton)`
  opacity: 0;
  transition: opacity ${transitions.cubic};
`;

const StyledStageNftWrapper = styled.div`
  position: relative;

  &:hover ${StyledUnstageButton} {
    opacity: 1;
  }

  &:hover ${StyledNftPreviewLabel} {
    opacity: 1;
  }

  &:hover ${StyledGradient} {
    opacity: 1;
  }
`;

export default StagedNftWrapper;
