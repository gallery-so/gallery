import { memo, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styled from 'styled-components';

import Gradient from 'components/core/Gradient/Gradient';
import transitions from 'components/core/transitions';
import { StyledNftPreviewLabel } from 'components/NftPreview/NftPreviewLabel';
import StagedNftImage from './StagedNftImage';
import UnstageButton from './UnstageButton';
import { graphql, useFragment } from 'react-relay';
import { SortableStagedNftFragment$key } from '__generated__/SortableStagedNftFragment.graphql';

type Props = {
  nftRef: SortableStagedNftFragment$key;
  size: number;
};

function SortableStagedNft({ nftRef, size }: Props) {
  const nft = useFragment(
    graphql`
      fragment SortableStagedNftFragment on Nft {
        dbid @required(action: THROW)
        ...StagedNftImageFragment
      }
    `,
    nftRef
  );

  const { dbid: id } = nft;

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

  return (
    <StyledSortableNft
      id={id}
      active={isDragging}
      // @ts-expect-error force overload
      style={style}
    >
      <StagedNftImage
        nftRef={nft}
        size={size}
        setNodeRef={setNodeRef}
        {...attributes}
        {...listeners}
      />
      <StyledUnstageButton id={id} />
      <StyledGradient type="top" direction="up" />
      <StyledGradient type="bottom" direction="down" />
    </StyledSortableNft>
  );
}

const StyledGradient = styled(Gradient)<{ type: 'top' | 'bottom' }>`
  position: absolute;
  ${({ type }) => type}: 0;

  opacity: 0;
  transition: opacity ${transitions.cubic};
`;

const StyledUnstageButton = styled(UnstageButton)`
  opacity: 0;
  top: 0;
  transition: opacity ${transitions.cubic};
`;

export const StyledSortableNft = styled.div`
  position: relative;
  -webkit-backface-visibility: hidden;
  &:focus {
    // ok to remove focus here because there it is not functionally 'in focus' for the user
    outline: none;
  }
  cursor: grab;
  margin: 24px;

  user-select: none;

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
