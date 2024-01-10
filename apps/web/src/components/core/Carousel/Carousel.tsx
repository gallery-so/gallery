import useEmblaCarousel from 'embla-carousel-react';
import React, { useCallback } from 'react';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import ArrowLeftIcon from '~/icons/ArrowLeftIcon';
import ArrowRightIcon from '~/icons/ArrowRightIcon';

import { HStack } from '../Spacer/Stack';

type Props = {
  slideContent: React.ReactNode[];
};

export const Carousel = ({ slideContent }: Props) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <StyledCarouselContainer align="center" gap={12}>
      <StyledButton onClick={scrollPrev}>
        <ArrowLeftIcon />
      </StyledButton>
      <StyledCarousel>
        <div ref={emblaRef}>
          <StyledSlidesContainer>
            {slideContent.map((slide, index) => (
              <StyledSlides key={index}>{slide}</StyledSlides>
            ))}
          </StyledSlidesContainer>
        </div>
      </StyledCarousel>
      <StyledButton onClick={scrollNext}>
        <ArrowRightIcon />
      </StyledButton>
    </StyledCarouselContainer>
  );
};

const StyledCarouselContainer = styled(HStack)`
  width: 100%;
`;

const StyledCarousel = styled.div`
  overflow: hidden;
`;
const StyledSlidesContainer = styled.div`
  display: flex;
`;

const StyledSlides = styled.div`
  flex: 0 0 100%;
  min-width: 0;
`;

const StyledButton = styled.button`
  border-radius: 50%;
  height: 32px;
  width: 32px;
  border: 1px solid ${colors.porcelain};
  display: flex;
  align-items: center;
  cursor: pointer;
  background: none;

  &:hover {
    background-color: ${colors.porcelain};
  }
`;
