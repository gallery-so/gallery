import styled from 'styled-components';

import IconContainer from '~/components/core/IconContainer';
import { ModalPaddingVariant } from '~/contexts/modal/constants';

type Props = {
  size?: number;
};

export default function CloseIcon({ size = 16 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
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
  mode?: 'light' | 'dark';
};

export function DecoratedCloseIcon({
  className,
  onClick,
  variant = 'standard',
  mode = 'light',
}: DecoratedCloseIconProps) {
  return (
    <StyledDecoratedCloseIcon className={className} variant={variant}>
      <IconContainer
        variant="default"
        mode={mode}
        size="sm"
        onClick={onClick}
        icon={<CloseIcon />}
      />
    </StyledDecoratedCloseIcon>
  );
}

const StyledDecoratedCloseIcon = styled.div<{ variant: DecoratedCloseIconProps['variant'] }>`
  cursor: pointer;
  padding: ${({ variant }) => (variant === 'standard' ? 8 : 16)}px;
  padding-left: 0;
`;
