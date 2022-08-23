import { memo, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styled from 'styled-components';

import Gradient from 'components/core/Gradient/Gradient';
import { StyledNftPreviewLabel } from 'components/NftPreview/NftPreviewLabel';
import StagedNftImage from './StagedNftImage';
import UnstageButton from './UnstageButton';
import { graphql, useFragment } from 'react-relay';
import { SortableStagedNftFragment$key } from '__generated__/SortableStagedNftFragment.graphql';
import { getBackgroundColorOverrideForContract } from 'utils/token';
import LiveDisplayButton, {
  StyledVideoDisabledIcon,
  StyledVideoEnabledIcon,
} from './LiveDisplayButton';
import isLiveMediaType from 'utils/isLiveMediaType';
import { SPACE_BETWEEN_ITEMS } from 'contexts/collectionEditor/useDndDimensions';
import { NftFailureBoundary } from 'components/NftFailureFallback/NftFailureBoundary';
import { NftFailureFallback } from 'components/NftFailureFallback/NftFailureFallback';
import { useNftDisplayRetryLoader } from 'hooks/useNftDisplayRetryLoader';
import colors from 'components/core/colors';

type Props = {
  tokenRef: SortableStagedNftFragment$key;
  size: number;
  mini: boolean;
};

// Potentially useful links:
// https://github.com/clauderic/dnd-kit/blob/6f762a4d8d0ea047c9e9ba324448d4aca258c6a0/stories/components/Item/Item.tsx
// https://github.com/clauderic/dnd-kit/blob/54c877875cf7ec6d4367ca11ce216cc3eb6475d2/stories/2%20-%20Presets/Sortable/Sortable.tsx#L201
// https://github.com/clauderic/dnd-kit/blob/6f762a4d8d0ea047c9e9ba324448d4aca258c6a0/stories/components/Item/Item.module.css#L43

function SortableStagedNft({ tokenRef, size, mini }: Props) {
  const token = useFragment(
    graphql`
      fragment SortableStagedNftFragment on Token {
        dbid @required(action: THROW)
        contract {
          contractAddress {
            address
          }
        }
        media {
          __typename
        }
        ...StagedNftImageFragment
      }
    `,
    tokenRef
  );
  const { dbid: id } = token;
  const { attributes, listeners, isDragging, setNodeRef, transform, transition } = useSortable({
    id,
  });

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? '0.2' : '1',
    }),
    [isDragging, transform, transition]
  );

  const isLiveType = isLiveMediaType(token.media?.__typename);
  const contractAddress = token.contract?.contractAddress?.address ?? '';
  const backgroundColorOverride = getBackgroundColorOverrideForContract(contractAddress);

  const { handleNftError, handleNftLoaded, retryKey } = useNftDisplayRetryLoader({
    tokenId: token.dbid,
  });

  return (
    <StyledSortableNft
      id={id}
      // @ts-expect-error force overload
      active={isDragging}
      style={style}
      backgroundColorOverride={backgroundColorOverride}
    >
      <NftFailureBoundary
        key={retryKey}
        fallback={
          <FallbackContainer ref={setNodeRef} size={size} {...attributes} {...listeners}>
            <NftFailureFallback noControls />
          </FallbackContainer>
        }
        onError={handleNftError}
      >
        <StagedNftImage
          tokenRef={token}
          size={size}
          hideLabel={mini}
          setNodeRef={setNodeRef}
          onLoad={handleNftLoaded}
          {...attributes}
          {...listeners}
        />
      </NftFailureBoundary>
      <StyledUnstageButton id={id} />
      {isLiveType && <LiveDisplayButton id={id} />}
      <StyledGradient type="top" direction="up" height={mini ? 40 : 64} />
      {mini ? null : <StyledGradient type="bottom" direction="down" />}
    </StyledSortableNft>
  );
}

const FallbackContainer = styled.div<{ size: number }>`
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
`;

const StyledGradient = styled(Gradient)<{ type: 'top' | 'bottom' }>`
  position: absolute;
  ${({ type }) => type}: 0;

  opacity: 0;
`;

const StyledUnstageButton = styled(UnstageButton)`
  opacity: 0;
  top: 0;
`;

export const StyledSortableNft = styled.div<{
  backgroundColorOverride: string;
}>`
  position: relative;
  -webkit-backface-visibility: hidden;
  &:focus {
    // ok to remove focus here because there it is not functionally 'in focus' for the user
    outline: none;
  }
  cursor: grab;

  margin: ${SPACE_BETWEEN_ITEMS / 2}px;

  ${({ backgroundColorOverride }) =>
    backgroundColorOverride && `background-color: ${backgroundColorOverride}`}};
  
  user-select: none;

  &:hover ${StyledVideoEnabledIcon} {
    mix-blend-mode: unset;
  }

  &:hover ${StyledVideoDisabledIcon} {
    mix-blend-mode: unset;
  }


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

export default memo(SortableStagedNft);
