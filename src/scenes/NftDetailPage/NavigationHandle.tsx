import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import Gradient from 'components/core/Gradient/Gradient';
import { BodyRegular } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import transitions from 'components/core/transitions';
import Spacer from 'components/core/Spacer/Spacer';
import { Directions } from 'components/core/enums';
import { useRouter } from 'next/router';
import breakpoints from 'components/core/breakpoints';

const ARROWS = new Map<number, string>([
  [Directions.LEFT, '←'],
  [Directions.RIGHT, '→'],
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
  const arrow = useMemo(() => ARROWS.get(direction) ?? '', [direction]);

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
      {/* <StyledGradient /> */}
      <StyledTextWrapper direction={direction}>
        {arrow}
        <Spacer width={8} />
        <StyledHoverText color={colors.gray50} caps>
          {hoverText}
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

  right: ${({ direction }) => (direction ? '0' : 'unset')};
  left: ${({ direction }) => (direction ? 'unset' : '0')};

  @media only screen and ${breakpoints.tablet} {
    position: relative;
    top: unset;
  }
`;

const StyledHoverText = styled(BodyRegular)`
  transition: opacity ${transitions.cubic};
  opacity: 0;
`;

const StyledGradient = styled(Gradient)`
  position: absolute;
  opacity: 0;
`;

const StyledNavigationHandle = styled.div<{ direction: Directions }>`
  display: flex;
  cursor: pointer;
  width: 100%;
  color: ${colors.gray50};

  position: absolute;
  bottom: 0;
  right: ${({ direction }) => (direction ? '0' : 'unset')};
  left: ${({ direction }) => (direction ? 'unset' : '0')};

  &:hover ${StyledGradient} {
    opacity: 1;
  }

  @media only screen and ${breakpoints.mobileLarge} {
    &:hover ${StyledHoverText} {
      opacity: 1;
    }
  }

  @media only screen and ${breakpoints.tablet} {
    right: ${({ direction }) => (direction ? '10px' : 'unset')};
    left: ${({ direction }) => (direction ? 'unset' : '10px')};
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
