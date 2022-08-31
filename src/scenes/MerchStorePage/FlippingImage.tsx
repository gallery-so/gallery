import Image from 'next/image';
import { useEffect } from 'react';
import styled from 'styled-components';

type Props = {
  src: string;
  isFlipped: boolean;
  isInPreview?: boolean;
  alt: string;
};

export default function FlippingImage({ alt, src, isFlipped, isInPreview = false }: Props) {
  useEffect(() => {
    // pre-load the back of the image to prevent initial stutter on hover
    const img = new window.Image();
    img.src = `${src}-back.jpg`;
  }, [src]);

  return (
    <StyledContainer
      isFlippedCardInPreview={src === '/merch/card' && isFlipped && isInPreview}
      isCard={src === '/merch/card'}
    >
      <Image alt={alt} src={isFlipped ? `${src}-back.jpg` : `${src}-front.jpg`} layout="fill" />
    </StyledContainer>
  );
}

const StyledContainer = styled.div<{ isFlippedCardInPreview: boolean; isCard: boolean }>`
  position: relative;
  user-select: none;

  // This styling forces the card "back" image to fill the entirety of the square
  height: ${({ isFlippedCardInPreview }) => (isFlippedCardInPreview ? '150%' : '100%')};
  width: ${({ isFlippedCardInPreview }) => (isFlippedCardInPreview ? '150%' : '100%')};
  margin: ${({ isFlippedCardInPreview }) => (isFlippedCardInPreview ? '-25%' : '0')};

  // On small screens, we increase the size of the card even in the product preview page
  @media only screen and (max-width: 768px) {
    height: ${({ isCard }) => (isCard ? '150%' : '100%')};
    width: ${({ isCard }) => (isCard ? '150%' : '100%')};
    margin: ${({ isCard }) => (isCard ? '-25%' : '0')};
  }
`;
