import styled from 'styled-components';
import colors from 'components/core/colors';
import { forwardRef } from 'react';

type Props = {
  onClick?: () => void;
};

export const CommentIcon = forwardRef<HTMLDivElement, Props>(({ onClick }, ref) => {
  return (
    <IconWrapper role="button" onClick={onClick} ref={ref}>
      <StyledSvg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
      >
        <path d="M3 17V4H21V17H12L7 21V17H3Z" />
      </StyledSvg>
    </IconWrapper>
  );
});

CommentIcon.displayName = 'CommentIcon';

export const AdmireIcon = forwardRef<HTMLDivElement, Props>(({ onClick }, ref) => {
  return (
    <IconWrapper ref={ref} role="button" onClick={onClick}>
      <StyledSvg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
      >
        <path d="M12 8C13.3261 8 14.5979 8.52678 15.5355 9.46447C16.4732 10.4021 17 11.6739 17 13" />
        <path d="M17 13C17 11.6739 17.5268 10.4021 18.4645 9.46447C19.4021 8.52678 20.6739 8 22 8" />
        <path d="M22 8C20.6739 8 19.4021 7.47322 18.4645 6.53553C17.5268 5.59785 17 4.32608 17 3" />
        <path d="M17 3C17 4.32608 16.4732 5.59785 15.5355 6.53553C14.5979 7.47322 13.3261 8 12 8" />
        <path d="M3 17C4.06087 17 5.07828 17.4214 5.82843 18.1716C6.57857 18.9217 7 19.9391 7 21" />
        <path d="M7 21C7 19.9391 7.42143 18.9217 8.17157 18.1716C8.92172 17.4214 9.93913 17 11 17" />
        <path d="M11 17C9.93913 17 8.92172 16.5786 8.17157 15.8284C7.42143 15.0783 7 14.0609 7 13" />
        <path d="M7 13C7 14.0609 6.57857 15.0783 5.82843 15.8284C5.07828 16.5786 4.06087 17 3 17" />
        <path d="M6 4V9" />
        <path d="M3.5 6.5H8.5" />
        <path d="M18 16V21" />
        <path d="M15.5 18.5H20.5" />
      </StyledSvg>
    </IconWrapper>
  );
});

AdmireIcon.displayName = 'AdmireIcon';

const StyledSvg = styled.svg`
  width: 24px;
  height: 24px;

  pointer-events: none;

  transition: transform 150ms ease-in-out, color 150ms ease-in-out;
`;

const IconWrapper = styled.div`
  width: 32px;
  height: 32px;
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;

  :active ${StyledSvg} {
    // Spec says 21.6 px which is 24 * .9
    transform: scale(0.9);
  }

  color: ${colors.offBlack};

  &:hover {
    color: ${colors.activeBlue} !important;
  }
`;
