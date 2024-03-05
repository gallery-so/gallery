import ArrowLeft from 'public/icons/arrow_left.svg';
import ArrowRight from 'public/icons/arrow_right.svg';
import { ReactElement, useMemo } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Directions } from '~/components/core/enums';
import IconContainer from '~/components/core/IconContainer';
import { HStack } from '~/components/core/Spacer/Stack';
import transitions from '~/components/core/transitions';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import ArrowLeftIcon from '~/icons/ArrowLeftIcon';
import ArrowRightIcon from '~/icons/ArrowRightIcon';
import colors from '~/shared/theme/colors';

const ARROWS = new Map<number, ReactElement>([
  [Directions.LEFT, <ArrowLeftIcon key={1} />],
  [Directions.RIGHT, <ArrowRightIcon key={2} />],
]);

const MOBILE_ARROWS = new Map<number, ReactElement>([
  [Directions.LEFT, <ArrowLeft key={1} />],
  [Directions.RIGHT, <ArrowRight key={2} />],
]);

type Props = {
  direction: Directions;
  onClick: () => void;
  hoverStyle: 'default' | 'transparent';
};

function NavigationHandle({ direction, onClick, hoverStyle = 'default' }: Props) {
  const isMobileOrMobileLarge = useIsMobileOrMobileLargeWindowWidth();

  const arrow = useMemo(
    () => (isMobileOrMobileLarge ? MOBILE_ARROWS.get(direction) : ARROWS.get(direction) ?? ''),
    [isMobileOrMobileLarge, direction]
  );

  return (
    <StyledNavigationHandle direction={direction}>
      <StyledTextWrapper
        align="center"
        gap={3}
        direction={direction}
        onClick={onClick}
        hoverStyle={hoverStyle}
      >
        {arrow && <IconContainer size="md" icon={arrow} variant={hoverStyle} />}
      </StyledTextWrapper>
    </StyledNavigationHandle>
  );
}

const StyledArrow = styled.div`
  path {
    transition: ${transitions.cubic};
  }
`;

const StyledTextWrapper = styled(HStack)<{
  direction: Directions;
  hoverStyle: 'default' | 'transparent';
}>`
  margin: auto;
  flex-direction: ${({ direction }) => (direction ? 'row-reverse' : 'row')};
  position: absolute;
  color: ${colors.metal};
  padding: 16px;
  margin: 0 -16px -16px -16px;
  cursor: pointer;

  // We want to set these to 0 rather than pageGutter.mobile because they are positioned absolutely
  // within the StyledPage, which already has padding equal to pageGutter.mobile
  right: ${({ direction }) => (direction ? '16px' : 'unset')};
  left: ${({ direction }) => (direction ? 'unset' : '16px')};

  &:hover ${StyledArrow} path {
    stroke: ${colors.black['800']};
  }

  @media only screen and ${breakpoints.tablet} {
    position: relative;
    top: unset;
    right: ${({ direction }) => (direction ? '0' : 'unset')};
    left: ${({ direction }) => (direction ? 'unset' : '0')};
    padding: 4px;
    margin: 0;
  }
`;

const StyledNavigationHandle = styled.div<{ direction: Directions }>`
  z-index: 10;

  // MOBILE POSITIONING - FIXED TO BOTTOM WITH 50% OPACITY GRADIENT
  position: fixed;
  bottom: 16px;
  height: auto;
  display: flex;
  place-items: flex-end;

  color: ${colors.metal};
  right: ${({ direction }) => (direction ? '0' : 'unset')};
  left: ${({ direction }) => (direction ? 'unset' : '0')};

  @media only screen and ${breakpoints.desktop} {
    height: 50%;
    width: unset;
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }

  // Prevent accidental selection rather than click
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -webkit-touch-callout: none;
`;

export default NavigationHandle;
