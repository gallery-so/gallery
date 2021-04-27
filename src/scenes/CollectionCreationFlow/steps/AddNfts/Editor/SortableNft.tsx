import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { memo, useCallback, useMemo, useState } from 'react';
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

  const [isActive, setIsActive] = useState(false);
  const [isDropping, setIsDropping] = useState(false);
  const handleStart = useCallback(() => setIsActive(true), []);
  const handleFinish = useCallback(() => {
    setIsActive(false);
    setIsDropping(true);
    setTimeout(() => setIsDropping(false), 200);
  }, []);

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition: isDropping ? 'transform 200ms ease' : transition,
    }),
    [transform, transition, isDropping]
  );

  console.log({ transform, transition });

  return (
    <StyledSortableNft
      ref={setNodeRef}
      // @ts-expect-error
      style={style}
      {...attributes}
      {...listeners}
      onMouseDown={handleStart}
      onMouseUp={handleFinish}
    >
      <StyledImage src={nft.image_url} alt={nft.id} isActive={isActive} />
    </StyledSortableNft>
  );
}

const StyledSortableNft = styled.div``;

const StyledImage = styled.img<{ isActive: boolean }>`
  transition: box-shadow 200ms cubic-bezier(0.18, 0.67, 0.6, 1.22);
  box-shadow: ${({ isActive }) =>
    isActive ? '0px 8px 15px 4px rgb(0 0 0 / 34%)' : 'none'};
`;

export default memo(SortableNft);
