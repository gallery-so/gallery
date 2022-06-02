import breakpoints from 'components/core/breakpoints';
import colors from 'components/core/colors';
import { MODAL_PADDING_MOBILE_PX, MODAL_PADDING_PX } from 'contexts/modal/AnimatedModal';
import { useCallback, useState } from 'react';
import styled from 'styled-components';

type Props = {
  isActive: boolean;
};

export default function CloseIcon({ isActive }: Props) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.6666 3.33334L3.33331 12.6667"
        stroke={isActive ? colors.offBlack : colors.shadow}
        stroke-miterlimit="10"
      />
      <path
        d="M3.33331 3.33334L12.6666 12.6667"
        stroke={isActive ? colors.offBlack : colors.shadow}
        stroke-miterlimit="10"
      />
    </svg>
  );
}

type DecoratedCloseIconProps = {
  className?: string;
  onClick?: () => void;
};

export function DecoratedCloseIcon({ className, onClick }: DecoratedCloseIconProps) {
  const [isHoveringOverCloseIcon, setIsHoveringOverCloseIcon] = useState(false);

  const handleCloseHover = useCallback(() => {
    setIsHoveringOverCloseIcon(true);
  }, []);

  const handleCloseLeave = useCallback(() => {
    setIsHoveringOverCloseIcon(false);
  }, []);

  return (
    <StyledDecoratedCloseIcon
      className={className}
      onClick={onClick}
      onMouseEnter={handleCloseHover}
      onMouseLeave={handleCloseLeave}
    >
      <CloseIcon isActive={isHoveringOverCloseIcon} />
    </StyledDecoratedCloseIcon>
  );
}

const StyledDecoratedCloseIcon = styled.div`
  cursor: pointer;
  padding: ${MODAL_PADDING_MOBILE_PX}px;

  @media only screen and ${breakpoints.mobileLarge} {
    padding: ${MODAL_PADDING_PX}px;
  }
`;
