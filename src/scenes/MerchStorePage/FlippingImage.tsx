import Image from 'next/image';
import { useState } from 'react';
import styled from 'styled-components';

export default function FlippingImage({
  src,
  isInPreview = false,
}: {
  src: string;
  isInPreview?: boolean;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <StyledContainer
      isFlippedCardInPreview={src === '/merch/card' && isFlipped && isInPreview}
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

const StyledContainer = styled.div<{ isFlippedCardInPreview: boolean }>`
  // This styling forces the card "back" image to fill the entirety of the square
  height: ${({ isFlippedCardInPreview }) => (isFlippedCardInPreview ? '150%' : '100%')};
  width: ${({ isFlippedCardInPreview }) => (isFlippedCardInPreview ? '150%' : '100%')};
  margin: ${({ isFlippedCardInPreview }) => (isFlippedCardInPreview ? '-25%' : '0')};
  position: relative;
  user-select: none;
`;
