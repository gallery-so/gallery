import useEmblaCarousel from 'embla-carousel-react';
import React, { useCallback } from 'react';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import { useIsDesktopWindowWidth } from '~/hooks/useWindowSize';
import ArrowLeftIcon from '~/icons/ArrowLeftIcon';
import ArrowRightIcon from '~/icons/ArrowRightIcon';

import breakpoints from '../breakpoints';
import { HStack } from '../Spacer/Stack';

type Props = {
  slideContent: React.ReactNode[];
};

export const Carousel = ({ slideContent }: Props) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    containScroll: false,
    loop: true,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const isDesktop = useIsDesktopWindowWidth();

  return (
    <StyledCarouselContainer align="center" gap={12}>
      {isDesktop && (
        <StyledButton onClick={scrollPrev}>
          <ArrowLeftIcon />
        </StyledButton>
      )}
      <StyledCarousel>
        <div ref={emblaRef}>
          <StyledSlidesContainer>
            {slideContent.map((slide, index) => (
              <StyledSlides key={index}>{slide}</StyledSlides>
            ))}
          </StyledSlidesContainer>
        </div>
      </StyledCarousel>
      {isDesktop && (
        <StyledButton onClick={scrollNext}>
          <ArrowRightIcon />
        </StyledButton>
      )}
    </StyledCarouselContainer>
  );
};

const StyledCarouselContainer = styled(HStack)`
  width: 100%;
  @media only screen and ${breakpoints.desktop} {
    padding: 0 8px;
  }
`;

const StyledCarousel = styled.div`
  overflow: hidden;
`;
const StyledSlidesContainer = styled.div`
  display: flex;
`;

const StyledSlides = styled.div`
  flex: 0 0 75%;
  min-width: 0;
  margin: 0 8px;

  @media only screen and ${breakpoints.desktop} {
    flex: 0 0 100%;
    margin: 0;
  }
`;

const StyledButton = styled.button`
  border-radius: 50%;
  height: 24px;
  width: 24px;
  border: 1px solid ${colors.porcelain};
  display: flex;
  align-items: center;
  cursor: pointer;
  background: none;

  &:hover {
    background-color: ${colors.porcelain};
  }
`;
