import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { memo } from 'react';
import styled from 'styled-components';
import { Nft } from 'types/Nft';

type Props = {
  nft: Nft;
};

function SortableNft({ nft }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: nft.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <StyledSortableNft
      ref={setNodeRef}
      // @ts-expect-error
      style={style}
      {...attributes}
      {...listeners}
    >
      <img src={nft.image_url} alt={nft.id} />
    </StyledSortableNft>
  );
}

const StyledSortableNft = styled.div``;

export default memo(SortableNft);
