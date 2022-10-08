import { useSortable } from '@dnd-kit/sortable';
import colors from 'components/core/colors';
import { BaseM } from 'components/core/Text/Text';
import transitions from 'components/core/transitions';
import { useEffect, useMemo, useRef } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { CSS } from '@dnd-kit/utilities';
import UnstageButton from './UnstageButton';
import { SPACE_BETWEEN_ITEMS } from 'contexts/collectionEditor/useDndDimensions';

type Props = {
  id: string;
  size: number;
};

const fadeinAnimationDuration = 1000;

export default function SortableStagedWhitespace({ id, size }: Props) {
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

  // Ensure that the fadein animation is only shown once upon mount.
  // After the animation completes (after fadeinAnimationDuration), disable future animations using a ref.
  const showFadeinAnimation = useRef(true);
  useEffect(() => {
    if (showFadeinAnimation.current) {
      setTimeout(() => {
        showFadeinAnimation.current = false;
      }, fadeinAnimationDuration);
    }
  }, []);

  return (
    <StyledSortableWhitespace
      id={id}
      // @ts-expect-error force overload
      active={isDragging}
      style={style}
    >
      <StyledWhitespace
        ref={setNodeRef}
        size={size}
        showAnimation={showFadeinAnimation.current}
        {...attributes}
        {...listeners}
      >
        <StyledWhitespaceLabel>Blank space</StyledWhitespaceLabel>
      </StyledWhitespace>
      <StyledUnstageButton id={id} variant="text" />
    </StyledSortableWhitespace>
  );
}

const fadeOutWhitespace = keyframes`
  from {
    opacity: 1;
  }
  to {
   opacity: 0;
  }
`;

const StyledUnstageButton = styled(UnstageButton)`
  opacity: 0;
  top: 0;
  transition: opacity ${transitions.cubic};
`;

const StyledWhitespaceLabel = styled(BaseM)`
  text-transform: uppercase;
  color: ${colors.metal};

  transition: opacity ${transitions.cubic};
`;

const StyledWhitespace = styled.div<{ size: number; showAnimation: boolean }>`
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  position: relative;
  border: 1px dashed ${colors.porcelain};
  transition: opacity ${transitions.cubic};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;

  ${({ showAnimation }) =>
    showAnimation &&
    css`
      animation: ${fadeOutWhitespace} ${fadeinAnimationDuration}ms linear;
    `}
`;

const StyledSortableWhitespace = styled.div`
  position: relative;
  -webkit-backface-visibility: hidden;
  &:focus {
    outline: none;
  }
  cursor: grab;

  margin: ${SPACE_BETWEEN_ITEMS / 2}px;

  ${BaseM} {
    color: ${colors.metal};
  }

  &:hover {
    ${StyledWhitespace} {
      opacity: 1;
    }

    ${StyledUnstageButton} {
      opacity: 1;
    }
  }
`;
