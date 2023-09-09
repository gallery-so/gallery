import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { BaseM } from '~/components/core/Text/Text';
import { StagedItemDraggingFragment$key } from '~/generated/StagedItemDraggingFragment.graphql';
import colors from '~/shared/theme/colors';

import StagedNftImageDragging from './StagedNftImageDragging';

type Props = {
  tokenRef: StagedItemDraggingFragment$key | null;
  size: number;
};

function StagedItemDragging({ tokenRef, size }: Props) {
  const token = useFragment(
    graphql`
      fragment StagedItemDraggingFragment on Token {
        ...StagedNftImageDraggingWithBoundaryFragment
      }
    `,
    tokenRef
  );

  if (token) {
    return <StagedNftImageDragging size={size} tokenRef={token} />;
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
