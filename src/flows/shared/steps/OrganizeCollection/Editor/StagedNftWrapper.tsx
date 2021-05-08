import { EditModeNft } from 'types/Nft';
import styled from 'styled-components';
import { StyledNftPreviewLabel } from 'components/NftPreview/NftPreviewLabel';
import Gradient from 'components/core/Gradient/Gradient';
import SortableStagedNft from './SortableStagedNft';
import UnstageButton from './UnstageButton';

type Props = {
  editModeNft: EditModeNft;
};

function StagedNftWrapper({ editModeNft }: Props) {
  return (
    <StyledStageNftWrapper>
      <StyledGradient type="top" />
      <StyledUnstageButton
        // TODO make index guaranteed
        nftIndex={editModeNft.index || 0}
      />
      <SortableStagedNft nft={editModeNft.nft} />
      <StyledGradient type="bottom" direction="down" />
    </StyledStageNftWrapper>
  );
}

// TODO: save this as a general transition under /core
const transitionStyle = `200ms cubic-bezier(0, 0, 0, 1.07)`;

const StyledGradient = styled(Gradient)<{ type: 'top' | 'bottom' }>`
  position: absolute;
  ${({ type }) => type}: 0;

  opacity: 0;
  transition: opacity ${transitionStyle};
`;

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

  &:hover ${StyledGradient} {
    opacity: 1;
  }
`;

export default StagedNftWrapper;
