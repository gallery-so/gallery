import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { memo, ReactNode, useMemo } from 'react';
import styled from 'styled-components';
import { Nft } from 'types/Nft';

type Props = {
  nft: Nft;
  children: ReactNode;
  activeId?: string;
};

function SortableNft({ nft, children, activeId }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: nft.id });

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
    }),
    [transform, transition]
  );

  const isActive = useMemo(() => activeId === nft.id, [activeId, nft.id]);

  return (
    <StyledSortableNft
      ref={setNodeRef}
      // @ts-expect-error
      style={style}
      {...attributes}
      {...listeners}
      isActive={isActive}
    >
      {children}
    </StyledSortableNft>
  );
}

// TODO: stop image from flashing when picking up
// TODO: enable image to scale smoothly when picking up
const StyledSortableNft = styled.div<{ isActive: boolean }>`
  // use !important because something is setting opacity: 0 inline during drop
  opacity: ${({ isActive }) => (isActive ? '0.5' : '1')} !important;
  transition: opacity 0.2s;

  &:focus {
    // ok to remove focus here because there it is not functionally 'in focus' for the user
    outline: none;
  }
`;

export default memo(SortableNft);
