import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import ActionText from 'components/core/ActionText/ActionText';
import colors from 'components/core/colors';
import transitions from 'components/core/transitions';
import Spacer from 'components/core/Spacer/Spacer';
import { Directions } from 'components/core/enums';
import { useRouter } from 'next/router';
import breakpoints, { pageGutter } from 'components/core/breakpoints';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
import ArrowLeft from 'public/icons/arrow_left.svg';
import ArrowRight from 'public/icons/arrow_right.svg';

const ARROWS = new Map<number, string>([
  [Directions.LEFT, '←'],
  [Directions.RIGHT, '→'],
]);

const MOBILE_ARROWS = new Map<number, any>([
  [Directions.LEFT, <ArrowLeft />],
  [Directions.RIGHT, <ArrowRight />],
]);

const HOVER_TEXT = new Map<number, string>([
  [Directions.LEFT, 'Prev'],
  [Directions.RIGHT, 'Next'],
]);

type Props = {
  direction: Directions;
  username: string;
  collectionId: string;
  nftId: string;
};

function NavigationHandle({ direction, username, collectionId, nftId }: Props) {
  const isMobileOrMobileLarge = useIsMobileOrMobileLargeWindowWidth();

  const arrow = useMemo(
    () => (isMobileOrMobileLarge ? MOBILE_ARROWS.get(direction) : ARROWS.get(direction) ?? ''),
    [isMobileOrMobileLarge, direction]
  );

  const hoverText = useMemo(() => HOVER_TEXT.get(direction) ?? '', [direction]);

  const { replace } = useRouter();
  const handleOnClick = useCallback(() => {
    // TODO(Terence): Figure out how to get this state across since Next doesn't support navigation state
    // void push(nftId, { state: { collection: [] } });
    // void push({ pathname: nftId });
    void replace(`/${username}/${collectionId}/${nftId}`);
  }, [nftId, collectionId, username, replace]);

  return (
    <StyledNavigationHandle onClick={handleOnClick} direction={direction}>
      <StyledTextWrapper direction={direction}>
        <ActionText>{arrow}</ActionText>
        <Spacer width={3} />
        <StyledHoverText>
          <ActionText>{hoverText}</ActionText>
        </StyledHoverText>
      </StyledTextWrapper>
    </StyledNavigationHandle>
  );
}

const StyledTextWrapper = styled.div<{ direction: Directions }>`
  display: flex;
  margin: auto;
  flex-direction: ${({ direction }) => (direction ? 'row-reverse' : 'row')};
  position: absolute;
  z-index: 100;
  color: ${colors.gray50};
  padding: 16px;
  margin: 0 -16px -16px -16px;

  // We want to set these to 0 rather than pageGutter.mobile because they are positioned absolutely
  // within the StyledPage, which already has padding equal to pageGutter.mobile
  right: ${({ direction }) => (direction ? '16px' : 'unset')};
  left: ${({ direction }) => (direction ? 'unset' : '16px')};

  @media only screen and ${breakpoints.tablet} {
    position: relative;
    top: unset;
    right: ${({ direction }) => (direction ? `${pageGutter.tablet}px` : 'unset')};
    left: ${({ direction }) => (direction ? 'unset' : `${pageGutter.tablet}px`)};
    padding: 0;
    margin: auto;
  }
`;

const StyledHoverText = styled.div`
  transition: opacity ${transitions.cubic};
  opacity: 0;
`;

const StyledNavigationHandle = styled.div<{ direction: Directions }>`
  // MOBILE POSITIONING - FIXED TO BOTTOM WITH 50% OPACITY GRADIENT
  position: fixed;
  bottom: 16px;
  height: auto;
  display: flex;
  place-items: flex-end;
  z-index: 1;
  cursor: pointer;

  color: ${colors.gray50};
  right: ${({ direction }) => (direction ? '0' : 'unset')};
  left: ${({ direction }) => (direction ? 'unset' : '0')};

  &:hover ${StyledHoverText} ${ActionText}, &:hover ${ActionText} {
    color: ${colors.black};
  }

  @media only screen and ${breakpoints.tablet} {
    &:hover ${StyledHoverText} {
      opacity: 1;
    }
  }

  @media only screen and ${breakpoints.tablet} {
    height: 100%;
    width: unset;
  }

  // Prevent accidental selection rather than click
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -webkit-touch-callout: none;
`;

export default NavigationHandle;
