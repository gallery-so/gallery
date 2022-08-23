import colors from 'components/core/colors';
import { BaseM } from 'components/core/Text/Text';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';
import { StagedItemDraggingFragment$key } from '__generated__/StagedItemDraggingFragment.graphql';
import StagedNftImageDragging from './StagedNftImageDragging';
import { NftFailureBoundary } from 'components/NftFailureFallback/NftFailureBoundary';
import { NftFailureFallback } from 'components/NftFailureFallback/NftFailureFallback';
import { useNftRetry } from 'hooks/useNftRetry';
import { StagedItemDraggingWrapperFragment$key } from '../../../../../../__generated__/StagedItemDraggingWrapperFragment.graphql';

type Props = {
  tokenRef: StagedItemDraggingFragment$key | null;
  isEditModeToken: boolean;
  size: number;
};

function StagedItemDragging({ tokenRef, isEditModeToken, size }: Props) {
  const token = useFragment(
    graphql`
      fragment StagedItemDraggingFragment on Token {
        ...StagedItemDraggingWrapperFragment
      }
    `,
    tokenRef
  );

  if (token && isEditModeToken) {
    return <StagedNftImageDraggingWrapper size={size} tokenRef={token} />;
  }

  return (
    <StyledBlankBlock size={size}>
      <StyledLabel>Blank Space</StyledLabel>
    </StyledBlankBlock>
  );
}

type StagedNftImageDraggingWrapperProps = {
  tokenRef: StagedItemDraggingWrapperFragment$key;
  size: number;
};

function StagedNftImageDraggingWrapper({ tokenRef, size }: StagedNftImageDraggingWrapperProps) {
  const token = useFragment(
    graphql`
      fragment StagedItemDraggingWrapperFragment on Token {
        dbid

        ...StagedNftImageDraggingFragment
      }
    `,
    tokenRef
  );

  const { handleNftError, handleNftLoaded, retryKey } = useNftRetry({
    tokenId: token.dbid,
  });

  return (
    <NftFailureBoundary
      key={retryKey}
      fallback={<NftFailureFallback noControls />}
      onError={handleNftError}
    >
      <StagedNftImageDragging onLoad={handleNftLoaded} tokenRef={token} size={size} />
    </NftFailureBoundary>
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
