import Image from 'next/image';
import { useState } from 'react';
import styled from 'styled-components';

export default function FlippingImage({ src }: { src: string }) {
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <StyledContainer
      isFlippedCard={src === '/merch/card' && isFlipped}
      onMouseOver={() => {
        setIsFlipped(true);
      }}
      onMouseOut={() => {
        setIsFlipped(false);
      }}
    >
      <Image src={isFlipped ? `${src}-back.jpg` : `${src}-front.jpg`} layout="fill" />
    </StyledContainer>
  );
}

const StyledContainer = styled.div<{ isFlippedCard: boolean }>`
  // This styling forces the card "back" image to fill the entirety of the square
  height: ${({ isFlippedCard }) => (isFlippedCard ? '150%' : '100%')};
  width: ${({ isFlippedCard }) => (isFlippedCard ? '150%' : '100%')};
  margin: ${({ isFlippedCard }) => (isFlippedCard ? '-25%' : '0')};
  position: relative;
  user-select: none;
`;
