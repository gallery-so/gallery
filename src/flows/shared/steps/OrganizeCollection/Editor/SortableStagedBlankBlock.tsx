import { useSortable } from '@dnd-kit/sortable';
import colors from 'components/core/colors';
import { BodyRegular, Caption } from 'components/core/Text/Text';
import transitions from 'components/core/transitions';
import { useEffect, useMemo, useRef } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { CSS } from '@dnd-kit/utilities';
import UnstageButton from './UnstageButton';

type Props = {
  id: string;
  size: number;
};

export default function SortableStagedBlankBlock({ id, size }: Props) {
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

  // we don't want to show the fadein animation on re-renders, so use a ref to control it
  const showFadeinAnimation = useRef(true);

  useEffect(() => {
    if (showFadeinAnimation.current) {
      setTimeout(() => {
        showFadeinAnimation.current = false;
      }, 1000);
    }
  }, []);

  return (
    <StyledSortableBlankBlock
      id={id}
      active={isDragging}
      // @ts-expect-error force overload
      style={style}
    >
      <StyledBlankBlock
        ref={setNodeRef}
        size={size}
        showAnimation={showFadeinAnimation.current}
        {...attributes}
        {...listeners}
      >
        <StyledBlankBlockLabel>Blank space</StyledBlankBlockLabel>
      </StyledBlankBlock>
      <StyledUnstageButton id={id} />
    </StyledSortableBlankBlock>
  );
}

const fadeOutBlankBlock = keyframes`
  from {
    opacity: initial;
  }
  transparent {
   opacity: 0;
  }
`;

const StyledUnstageButton = styled(UnstageButton)`
  opacity: 0;
  top: 0;
  transition: opacity ${transitions.cubic};
`;

const StyledBlankBlockLabel = styled(Caption)`
  text-transform: uppercase;
  color: ${colors.gray50};

  transition: opacity ${transitions.cubic};
`;

const StyledBlankBlock = styled.div<{ size: number; showAnimation: boolean }>`
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  position: relative;
  border: 1px dashed ${colors.gray30};
  transition: opacity ${transitions.cubic};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;

  ${({ showAnimation }) =>
    showAnimation &&
    css`
      animation: ${fadeOutBlankBlock} 1s linear;
    `}
`;

const StyledSortableBlankBlock = styled.div`
  position: relative;
  -webkit-backface-visibility: hidden;
  &:focus {
    outline: none;
  }
  cursor: grab;

  margin: 24px;
  ${BodyRegular} {
    color: ${colors.gray50};
  }

  &:hover {
    ${StyledBlankBlock} {
      // border: 1px dashed ${colors.gray30};
      opacity: 1;
    }

    ${StyledUnstageButton} {
      opacity: 1;
    }
  }
`;
