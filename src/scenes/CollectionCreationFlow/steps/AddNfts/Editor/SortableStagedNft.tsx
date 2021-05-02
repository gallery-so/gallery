import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { memo, ReactNode, useMemo } from 'react';
import styled from 'styled-components';
import { Nft } from 'types/Nft';
import StagedNftImage from './StagedNftImage';

type Props = {
  nft: Nft;
  activeId?: string;
};

function SortableStagedNft({ nft, activeId, ...props }: Props) {
  const {
    attributes,
    listeners,
    isDragging,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: nft.id });

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? '0.2' : '1',
    }),
    [isDragging, transform, transition]
  );

  return (
    <StyledSortableNft
      ref={setNodeRef}
      id={nft.id}
      active={isDragging}
      // @ts-expect-error
      style={style}
      {...attributes}
      {...listeners}
    >
      <StagedNftImage nft={nft} />
    </StyledSortableNft>
  );
}

// TODO: enable image to scale smoothly when picking up
const StyledSortableNft = styled.div`
  -webkit-backface-visibility: hidden;
  &:focus {
    // ok to remove focus here because there it is not functionally 'in focus' for the user
    outline: none;
  }
  cursor: grab;
`;

export default memo(SortableStagedNft);
