import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { memo, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { StyledNftPreviewLabel } from '~/components/NftPreview/NftPreviewLabel';
import { SPACE_BETWEEN_ITEMS } from '~/contexts/collectionEditor/useDndDimensions';
import { SortableStagedNftFragment$key } from '~/generated/SortableStagedNftFragment.graphql';
import isLiveMediaType from '~/utils/isLiveMediaType';
import { getBackgroundColorOverrideForContract } from '~/utils/token';

import HdButton from './HdButton';
import LiveDisplayButton from './LiveDisplayButton';
import StagedNftImage from './StagedNftImage';
import UnstageButton from './UnstageButton';

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
        definition {
          contract {
            contractAddress {
              address
            }
          }
          media {
            __typename
          }
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

  const isLiveType = isLiveMediaType(token.definition.media?.__typename);
  const contractAddress = token.definition.contract?.contractAddress?.address ?? '';
  const backgroundColorOverride = getBackgroundColorOverrideForContract(contractAddress);

  return (
    <StyledSortableNft
      id={id}
      // @ts-expect-error force overload
      active={isDragging}
      style={style}
      backgroundColorOverride={backgroundColorOverride}
    >
      <StagedNftImage
        tokenRef={token}
        size={size}
        hideLabel={mini}
        setNodeRef={setNodeRef}
        {...attributes}
        {...listeners}
      />
      <StyledUnstageButton id={id} />
      {isLiveType ? <StyledLiveDisplayButton id={id} /> : <StyledHdButton id={id} />}
    </StyledSortableNft>
  );
}

const StyledUnstageButton = styled(UnstageButton)`
  opacity: 0;
  top: 0;
`;

const StyledHdButton = styled(HdButton)`
  opacity: 0;
`;

const StyledLiveDisplayButton = styled(LiveDisplayButton)`
  opacity: 0;
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

  &:hover ${StyledUnstageButton} {
    opacity: 1;
  }

  &:hover ${StyledHdButton} {
    opacity: 1;
  }

  &:hover ${StyledLiveDisplayButton} {
    opacity: 1;
  }

  &:hover ${StyledNftPreviewLabel} {
    opacity: 1;
  }
`;

export default memo(SortableStagedNft);
