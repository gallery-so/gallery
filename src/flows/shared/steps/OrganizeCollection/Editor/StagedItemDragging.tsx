import colors from 'components/core/colors';
import { Caption } from 'components/core/Text/Text';
import styled from 'styled-components';
import { EditModeNft } from '../types';
import StagedNftImageDragging from './StagedNftImageDragging';

type Props = {
  editModeNft: EditModeNft;
  size: number;
};
// used for all dragged items, determines whehter to use block or nft
function StagedItemDragging({ editModeNft, size }: Props) {
  if (!editModeNft.nft) {
    return (
      <StyledBlankBlock size={size}>
        <StyledLabel>Blank Space</StyledLabel>
      </StyledBlankBlock>
    );
  }

  return <StagedNftImageDragging nft={editModeNft.nft} size={size} />;
}

const StyledBlankBlock = styled.div<{ size: number }>`
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: grabbing;

  background-color: ${colors.white};

  box-shadow: 0px 0px 16px 4px rgb(0 0 0 / 34%);
`;

const StyledLabel = styled(Caption)`
  text-transform: uppercase;
  color: ${colors.gray50};
`;

export default StagedItemDragging;
