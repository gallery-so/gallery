import { ReactElement, useMemo } from 'react';
import styled from 'styled-components';
import ActionText from 'components/core/ActionText/ActionText';
import colors from 'components/core/colors';
import transitions from 'components/core/transitions';
import DeprecatedSpacer from 'components/core/Spacer/DeprecatedSpacer';
import { Directions } from 'components/core/enums';
import breakpoints from 'components/core/breakpoints';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
import ArrowLeft from 'public/icons/arrow_left.svg';
import ArrowRight from 'public/icons/arrow_right.svg';
import ArrowLeftIcon from 'src/icons/ArrowLeftIcon';
import ArrowRightIcon from 'src/icons/ArrowRightIcon';

const ARROWS = new Map<number, ReactElement>([
  [Directions.LEFT, <ArrowLeftIcon key={1} />],
  [Directions.RIGHT, <ArrowRightIcon key={2} />],
]);

const MOBILE_ARROWS = new Map<number, ReactElement>([
  [Directions.LEFT, <ArrowLeft key={1} />],
  [Directions.RIGHT, <ArrowRight key={2} />],
]);

const HOVER_TEXT = new Map<number, string>([
  [Directions.LEFT, 'Prev'],
  [Directions.RIGHT, 'Next'],
]);

type Props = {
  direction: Directions;
  onClick: () => void;
};

function NavigationHandle({ direction, onClick }: Props) {
  const isMobileOrMobileLarge = useIsMobileOrMobileLargeWindowWidth();

  const arrow = useMemo(
    () => (isMobileOrMobileLarge ? MOBILE_ARROWS.get(direction) : ARROWS.get(direction) ?? ''),
    [isMobileOrMobileLarge, direction]
  );

  const hoverText = useMemo(() => HOVER_TEXT.get(direction) ?? '', [direction]);

  return (
    <StyledNavigationHandle direction={direction}>
      <StyledTextWrapper direction={direction} onClick={onClick}>
        <StyledArrow>{arrow}</StyledArrow>
        <DeprecatedSpacer width={3} />
        <StyledHoverText>
          <ActionText>{hoverText}</ActionText>
        </StyledHoverText>
      </StyledTextWrapper>
    </StyledNavigationHandle>
  );
}

const StyledHoverText = styled.div`
  transition: ${transitions.cubic};
  opacity: 0;
  padding: 0px 4px;
`;

const StyledArrow = styled.div`
  path {
    transition: ${transitions.cubic};
  }
`;

const StyledTextWrapper = styled.div<{ direction: Directions }>`
  display: flex;
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

  &:hover ${StyledHoverText} ${ActionText} {
    color: ${colors.offBlack};
  }

  &:hover ${StyledArrow} path {
    stroke: ${colors.offBlack};
  }

  @media only screen and ${breakpoints.desktop} {
    &:hover ${StyledHoverText} {
      opacity: 1;
    }
  }

  @media only screen and ${breakpoints.tablet} {
    position: relative;
    top: unset;
    right: ${({ direction }) => (direction ? '0' : 'unset')};
    left: ${({ direction }) => (direction ? 'unset' : '0')};
    padding: 24px;
    margin: auto;
  }
`;

const StyledNavigationHandle = styled.div<{ direction: Directions }>`
  z-index: 2;

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
    height: 100%;
    width: unset;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  // Prevent accidental selection rather than click
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -webkit-touch-callout: none;
`;

export default NavigationHandle;
