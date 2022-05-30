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
import { getBackgroundColorOverrideForContract } from 'utils/nft';
import { PADDING_BETWEEN_STAGED_IMAGES_PX } from './constants';

type Props = {
  nftRef: SortableStagedNftFragment$key;
  size: number;
  mini: boolean;
};

function SortableStagedNft({ nftRef, size, mini }: Props) {
  const nft = useFragment(
    graphql`
      fragment SortableStagedNftFragment on Nft {
        dbid @required(action: THROW)
        contractAddress
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

  const backgroundColorOverride = useMemo(
    () => getBackgroundColorOverrideForContract(nft.contractAddress ?? ''),
    [nft.contractAddress]
  );

  return (
    <StyledSortableNft
      id={id}
      active={isDragging}
      // @ts-expect-error force overload
      style={style}
      backgroundColorOverride={backgroundColorOverride}
    >
      <StagedNftImage
        nftRef={nft}
        size={size}
        hideLabel={mini}
        setNodeRef={setNodeRef}
        {...attributes}
        {...listeners}
      />
      <StyledUnstageButton id={id} />
      <StyledGradient type="top" direction="up" height={mini ? 40 : 64} />
      {mini ? null : <StyledGradient type="bottom" direction="down" />}
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

export const StyledSortableNft = styled.div<{ backgroundColorOverride: string }>`
  position: relative;
  -webkit-backface-visibility: hidden;
  &:focus {
    // ok to remove focus here because there it is not functionally 'in focus' for the user
    outline: none;
  }
  cursor: grab;

  margin: ${PADDING_BETWEEN_STAGED_IMAGES_PX / 2}px;

  ${({ backgroundColorOverride }) =>
    backgroundColorOverride && `background-color: ${backgroundColorOverride}`}};
  

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
