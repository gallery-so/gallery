import colors from 'components/core/colors';
import { BaseM } from 'components/core/Text/Text';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';
import { StagedItemDraggingFragment$key } from '__generated__/StagedItemDraggingFragment.graphql';
import StagedNftImageDragging from './StagedNftImageDragging';

type Props = {
  tokenRef: StagedItemDraggingFragment$key;
  isEditModeToken: boolean;
  size: number;
};

function StagedItemDragging({ tokenRef, isEditModeToken, size }: Props) {
  const token = useFragment(
    graphql`
      fragment StagedItemDraggingFragment on Token {
        ...StagedNftImageDraggingFragment
      }
    `,
    tokenRef
  );

  if (isEditModeToken) {
    return <StagedNftImageDragging tokenRef={token} size={size} />;
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
  color: ${colors.metal};
`;

export default StagedItemDragging;
