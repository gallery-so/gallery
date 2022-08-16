import Image from 'next/image';
import { useState } from 'react';
import styled from 'styled-components';
import breakpoints from 'components/core/breakpoints';

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
  // max-height: ${({ isFlippedCardInPreview }) => (isFlippedCardInPreview ? 'none' : '90vw')};
  // max-width: ${({ isFlippedCardInPreview }) => (isFlippedCardInPreview ? 'none' : '90vw')};
  position: relative;
  user-select: none;

  // This styling forces the card "back" image to fill the entirety of the square
  height: ${({ isFlippedCardInPreview }) => (isFlippedCardInPreview ? '150%' : '100%')};
  width: ${({ isFlippedCardInPreview }) => (isFlippedCardInPreview ? '150%' : '100%')};
  margin: ${({ isFlippedCardInPreview }) => (isFlippedCardInPreview ? '-25%' : '0')};

  @media only screen and ${breakpoints.tablet} {
    max-height: none;
    max-width: none;
  }
`;
