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
import { getBackgroundColorOverrideForContract } from 'utils/token';
import useDndDimensions from 'contexts/collectionEditor/useDndDimensions';
import LiveDisplayButton from './LiveDisplayButton';

type Props = {
  tokenRef: SortableStagedNftFragment$key;
  size: number;
  mini: boolean;
};

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

  if (!token) {
    throw new Error('SortableStagedNft: token not provided');
  }

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

  const contractAddress = token.contract?.contractAddress?.address ?? '';

  const backgroundColorOverride = useMemo(
    () => getBackgroundColorOverrideForContract(contractAddress),
    [contractAddress]
  );

  const { paddingBetweenItemsPx } = useDndDimensions();

  const isLiveMediaType = useMemo(() => {
    return (
      token.media?.__typename === 'VideoMedia' ||
      token.media?.__typename === 'HtmlMedia' ||
      token.media?.__typename === 'GltfMedia'
    );
  }, [token.media?.__typename]);

  return (
    <StyledSortableNft
      id={id}
      active={isDragging}
      // @ts-expect-error force overload
      style={style}
      backgroundColorOverride={backgroundColorOverride}
      paddingBetweenItems={paddingBetweenItemsPx}
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
      {isLiveMediaType && <LiveDisplayButton id={id} />}
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

export const StyledSortableNft = styled.div<{
  backgroundColorOverride: string;
  paddingBetweenItems: number;
}>`
  position: relative;
  -webkit-backface-visibility: hidden;
  &:focus {
    // ok to remove focus here because there it is not functionally 'in focus' for the user
    outline: none;
  }
  cursor: grab;

  margin: ${({ paddingBetweenItems }) => paddingBetweenItems / 2}px;

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
