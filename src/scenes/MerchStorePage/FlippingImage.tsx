import Image from 'next/image';
import { useState } from 'react';
import styled from 'styled-components';

export default function FlippingImage({ src }: { src: string }) {
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <StyledContainer
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

const StyledContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  user-select: none;
`;
