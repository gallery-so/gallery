import colors from 'components/core/colors';
import styled from 'styled-components';
import { useCallback, useMemo, useState } from 'react';

type Props = {
  isFollowing: boolean;
  onClick: () => void;
  disabled: boolean;
};

const FollowIcon = function ({ className }: { className: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z"
        stroke="#707070"
      />
      <path d="M1 20.5V16.5L4 13.5L8.5 15L13 13.5L16 16.5V20.5" stroke="#707070" />
      <path d="M19.5 6.5V13.5" stroke="#707070" stroke-miterlimit="10" />
      <path d="M23 10H16" stroke="#707070" stroke-miterlimit="10" />
    </svg>
  );
};

const UnfollowIcon = function ({ className }: { className: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z"
        stroke="#707070"
      />
      <path d="M1 20.5V16.5L4 13.5L8.5 15L13 13.5L16 16.5V20.5" stroke="#707070" />
      <path d="M23 10H16" stroke="#707070" stroke-miterlimit="10" />
    </svg>
  );
};

const FollowingIcon = function ({ className }: { className: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z"
        stroke="#0022F0"
      />
      <path d="M1 20.5V16.5L4 13.5L8.5 15L13 13.5L16 16.5V20.5" stroke="#0022F0" />
      <path d="M16 9.5L18.5 12L23 7.5" stroke="#0022F0" stroke-miterlimit="10" />
    </svg>
  );
};

export default function IconButton({ isFollowing, onClick, disabled }: Props) {
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseExit = useCallback(() => {
    setIsHovering(false);
  }, []);

  const DisplayedIcon = useMemo(() => {
    if (isFollowing) {
      if (isHovering) {
        return StyledUnfollowIcon;
      }
      return FollowingIcon;
    }
    return StyledFollowIcon;
  }, [isFollowing, isHovering]);

  return (
    <StyledButtonWrapper onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseExit}>
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
  border: 1px solid ${colors.porcelain};
  color: ${colors.shadow};
  background: none;
  cursor: pointer;
  padding: 7px;
  transition: opacity 200ms ease-in-out, background 200ms ease-in-out, scale 200ms ease-in-out;

  &:hover {
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
