import colors from 'components/core/colors';
import { BaseM } from 'components/core/Text/Text';
import styled from 'styled-components';
import { StagingItem, isEditModeNft } from '../types';
import StagedNftImageDragging from './StagedNftImageDragging';

type Props = {
  stagedItem: StagingItem;
  size: number;
};

function StagedItemDragging({ stagedItem, size }: Props) {
  if (isEditModeNft(stagedItem)) {
    return <StagedNftImageDragging nft={stagedItem.nft} size={size} />;
  }

  return (
    <StyledBlankBlock size={size}>
      <StyledLabel>Blank Space</StyledLabel>
    </StyledBlankBlock>
  );
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

const StyledLabel = styled(BaseM)`
  text-transform: uppercase;
  color: ${colors.gray50};
`;

export default StagedItemDragging;
