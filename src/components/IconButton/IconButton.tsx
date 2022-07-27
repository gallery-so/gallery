import colors from 'components/core/colors';
import styled from 'styled-components';
import { useCallback, useMemo, useState } from 'react';
import FollowIcon from 'src/icons/FollowIcon';
import FollowingIcon from 'src/icons/FollowingIcon';
import UnfollowIcon from 'src/icons/UnfollowIcon';
import Tooltip from 'components/Tooltip/Tooltip';

type Props = {
  isFollowing: boolean;
  onClick: () => void;
  disabled: boolean;
  isSignedIn: boolean;
  isAuthenticatedUsersPage: boolean;
};

export default function IconButton({
  isFollowing,
  onClick,
  disabled,
  isSignedIn,
  isAuthenticatedUsersPage,
}: Props) {
  const DisplayedIcon = useMemo(
    () => (isFollowing ? FollowingIcon : StyledFollowIcon),
    [isFollowing]
  );

  const [showTooltip, setShowTooltip] = useState(false);
  // This state is used to track when the user clicks the button but hasn't moused out yet, to display a special state such as disabling the tooltip and default hover behavior.
  // ie When the user clicks follow, we want to immediately show the default Following state (Following icon), instead of the hover state (Unfollow icon)
  const [clickedAndStillHovering, setClickedAndStillHovering] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setShowTooltip(true);
  }, []);

  const handleMouseExit = useCallback(() => {
    setShowTooltip(false);
    setClickedAndStillHovering(false);
  }, []);

  const HoverIcon = useMemo(() => {
    if (isFollowing) {
      return clickedAndStillHovering ? FollowingIcon : StyledUnfollowIcon;
    }
    return StyledFollowIcon;
  }, [clickedAndStillHovering, isFollowing]);

  const tooltipText = useMemo(() => {
    if (!isSignedIn) {
      return 'Please sign in to follow.';
    }

    // When the user clicks the button, the tooltip fades out. However, since isFollowing gets updated, the tooltip text will briefly change as its fading out, which we don't want.
    // This prevents that by displaying the correct tooltip text while the user is still hovering over the button after clicking it.
    if (clickedAndStillHovering) {
      return isFollowing ? 'Follow' : 'Unfollow';
    }
    return isFollowing ? 'Unfollow' : 'Follow';
  }, [clickedAndStillHovering, isFollowing, isSignedIn]);

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      setShowTooltip(false);
      setClickedAndStillHovering(true);
      onClick();
    },
    [onClick]
  );

  return (
    <StyledButtonWrapper>
      <StyledButton disabled={disabled} onClick={handleClick} data-testid="follow-button">
        <CircleSvgWrapper>
          <circle
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseExit}
            r="20"
            cx="20"
            cy="20"
            fill="blue"
            fillOpacity={0}
            style={{ pointerEvents: 'initial' }}
          />
        </CircleSvgWrapper>
        <StyledDefaultIconWrapper>
          <DisplayedIcon />
        </StyledDefaultIconWrapper>
        <StyledHoverIconWrapper>
          <HoverIcon />
        </StyledHoverIconWrapper>
      </StyledButton>
      <StyledTooltip
        text={tooltipText}
        showTooltip={!isAuthenticatedUsersPage && showTooltip}
        dataTestId="follow-button-tooltip"
      />
    </StyledButtonWrapper>
  );
}

const StyledTooltip = styled(Tooltip)<{ showTooltip: boolean }>`
  opacity: ${({ showTooltip }) => (showTooltip ? 1 : 0)};
  transform: translateY(${({ showTooltip }) => (showTooltip ? 6 : 0)}px);
`;

const CircleSvgWrapper = styled.svg`
  height: 40px;
  width: 40px;
  position: absolute;
  z-index: 10;
  top: 0;
  left: 0;
  pointer-events: none;
`;

const StyledUnfollowIcon = styled(UnfollowIcon)`
  path {
    stroke: ${colors.offBlack};
  }
`;

const StyledFollowIcon = styled(FollowIcon)`
  path {
    stroke: ${colors.shadow};
  }
`;

const StyledHoverIconWrapper = styled.div`
  display: none;
`;
const StyledDefaultIconWrapper = styled.div``;

const StyledButtonWrapper = styled.div`
  height: 40px;
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border-radius: 50%;

  ${StyledTooltip} {
    left: 0;
    bottom: -22px;
  }
`;

const StyledButton = styled.button<{ disabled: boolean }>`
  height: 100%;
  width: 100%;
  border-radius: 50%;
  color: ${colors.shadow};
  border: 1px solid transparent;
  background: none;
  cursor: pointer;
  padding: 7px;
  position: relative;
  transition: opacity 200ms ease-in-out, background 200ms ease-in-out, scale 200ms ease-in-out,
    border 200ms ease-in-out;
  overflow: hidden;

  &:hover {
    border: 1px solid ${colors.porcelain};
    color: ${colors.offBlack};
    background: ${colors.offWhite};

    ${StyledFollowIcon} {
      path {
        stroke: ${colors.offBlack};
      }
    }

    ${StyledDefaultIconWrapper} {
      display: none;
    }

    ${StyledHoverIconWrapper} {
      display: block;
    }
  }

  &:disabled {
    cursor: initial;
    pointer-events: none;
    border: none;
    background: none;

    ${StyledFollowIcon} {
      path {
        stroke: ${colors.porcelain};
      }
    }
  }
  &:active {
    color: ${colors.offBlack};
    transform: scale(0.9);
  }
`;
