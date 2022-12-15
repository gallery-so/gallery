import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import { BaseM } from '~/components/core/Text/Text';
import { NftFailureBoundary } from '~/components/NftFailureFallback/NftFailureBoundary';
import { NftFailureFallback } from '~/components/NftFailureFallback/NftFailureFallback';
import { StagedItemDraggingNewFragment$key } from '~/generated/StagedItemDraggingNewFragment.graphql';
import { StagedItemDraggingWrapperNewFragment$key } from '~/generated/StagedItemDraggingWrapperNewFragment.graphql';
import { useNftRetry } from '~/hooks/useNftRetry';
import noop from '~/utils/noop';

import StagedNftImageDragging from './StagedNftImageDragging';

type Props = {
  tokenRef: StagedItemDraggingNewFragment$key | null;
  isEditModeToken: boolean;
  size: number;
};

function StagedItemDragging({ tokenRef, isEditModeToken, size }: Props) {
  const token = useFragment(
    graphql`
      fragment StagedItemDraggingNewFragment on Token {
        ...StagedItemDraggingWrapperNewFragment
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
  tokenRef: StagedItemDraggingWrapperNewFragment$key;
  size: number;
};

function StagedNftImageDraggingWrapper({ tokenRef, size }: StagedNftImageDraggingWrapperProps) {
  const token = useFragment(
    graphql`
      fragment StagedItemDraggingWrapperNewFragment on Token {
        dbid

        ...StagedNftImageDraggingNewFragment
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
      tokenId={token.dbid}
      fallback={<NftFailureFallback refreshing={false} onRetry={noop} />}
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
