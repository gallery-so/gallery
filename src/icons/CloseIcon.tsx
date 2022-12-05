import styled from 'styled-components';

import IconContainer from '~/components/core/Markdown/IconContainer';
import { ModalPaddingVariant } from '~/contexts/modal/constants';

export default function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      datatest-id="close-icon"
    >
      <path d="M12.6667 3.33333L3.33333 12.6667" strokeMiterlimit="10" />
      <path d="M3.33333 3.33333L12.6667 12.6667" strokeMiterlimit="10" />
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
  return (
    <StyledDecoratedCloseIcon className={className} variant={variant}>
      <IconContainer onClick={onClick} icon={<CloseIcon />} />
    </StyledDecoratedCloseIcon>
  );
}

const StyledDecoratedCloseIcon = styled.div<{ variant: DecoratedCloseIconProps['variant'] }>`
  cursor: pointer;
  padding: ${({ variant }) => (variant === 'standard' ? 8 : 16)}px;
  padding-left: 0;
`;
