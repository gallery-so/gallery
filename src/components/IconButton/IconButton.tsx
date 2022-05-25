import colors from 'components/core/colors';
import styled from 'styled-components';
import { useMemo } from 'react';
import FollowIcon from 'src/icons/FollowIcon';
import FollowingIcon from 'src/icons/FollowingIcon';
import UnfollowIcon from 'src/icons/UnfollowIcon';

type Props = {
  isHovering: boolean;
  clickedAndStillHovering: boolean;
  isFollowing: boolean;
  onClick: () => void;
  disabled: boolean;
};

export default function IconButton({
  isFollowing,
  isHovering,
  clickedAndStillHovering,
  onClick,
  disabled,
}: Props) {
  const DisplayedIcon = useMemo(() => {
    if (isFollowing) {
      if (isHovering && !clickedAndStillHovering) {
        return StyledUnfollowIcon;
      }
      return FollowingIcon;
    }
    return StyledFollowIcon;
  }, [clickedAndStillHovering, isFollowing, isHovering]);

  return (
    <StyledButtonWrapper>
      <StyledButton disabled={disabled} onClick={onClick}>
        <DisplayedIcon />
      </StyledButton>
    </StyledButtonWrapper>
  );
}

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

const StyledButtonWrapper = styled.div`
  height: 40px;
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
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
  transition: opacity 200ms ease-in-out, background 200ms ease-in-out, scale 200ms ease-in-out,
    border 200ms ease-in-out;

  &:hover {
    border: 1px solid ${colors.porcelain};
    color: ${colors.offBlack};
    background: ${colors.offWhite};

    ${StyledFollowIcon} {
      path {
        stroke: ${colors.offBlack};
      }
    }
  }

  &:disabled {
    cursor: initial;
    pointer-events: none;
    border: none;

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
