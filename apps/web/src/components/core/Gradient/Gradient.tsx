import { memo } from 'react';
import styled from 'styled-components';

type Props = {
  className?: string;
  height?: number;
  direction?: 'up' | 'down';
};

export default memo(function Gradient({ className, height = 64, direction = 'up' }: Props) {
  return <StyledGradient className={className} height={height} direction={direction} />;
});

const StyledGradient = styled.div<Props>`
  background-image: linear-gradient(
    ${({ direction }) => (direction === 'up' ? 'to top' : 'to bottom')},
    rgba(0, 0, 0, 0),
    rgba(0, 0, 0, 0.25) 40%,
    rgba(0, 0, 0, 0.6) 100%
  );
  height: ${({ height }) => height}px;
  width: 100%;
  z-index: 1;
`;
