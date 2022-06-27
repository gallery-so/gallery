import colors from 'components/core/colors';
import {
  ModalPaddingVariant,
  MODAL_PADDING_PX,
  MODAL_PADDING_THICC_PX,
} from 'contexts/modal/constants';
import { useCallback, useState } from 'react';
import styled from 'styled-components';

type Props = {
  isActive: boolean;
};

export default function CloseIcon({ isActive }: Props) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.6667 3.33333L3.33333 12.6667"
        stroke={isActive ? colors.offBlack : colors.shadow}
        stroke-miterlimit="10"
      />
      <path
        d="M3.33333 3.33333L12.6667 12.6667"
        stroke={isActive ? colors.offBlack : colors.shadow}
        stroke-miterlimit="10"
      />
    </svg>
  );
}

type DecoratedCloseIconProps = {
  className?: string;
  onClick?: () => void;
  variant?: ModalPaddingVariant;
};

export function DecoratedCloseIcon({
  className,
  onClick,
  variant = 'standard',
}: DecoratedCloseIconProps) {
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
      variant={variant}
    >
      <CloseIcon isActive={isHoveringOverCloseIcon} />
    </StyledDecoratedCloseIcon>
  );
}

const StyledDecoratedCloseIcon = styled.div<{ variant: DecoratedCloseIconProps['variant'] }>`
  cursor: pointer;
  padding: ${({ variant }) =>
    variant === 'standard' ? MODAL_PADDING_PX : MODAL_PADDING_THICC_PX}px;
`;
