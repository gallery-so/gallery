import colors from 'components/core/colors';
import { BaseS } from 'components/core/Text/Text';
import styled from 'styled-components';

type Props = {
  text: string;
};

export default function Tooltip({ text }: Props) {
  return (
    <StyledTooltip>
      <BaseS color={colors.white}>{text}</BaseS>
    </StyledTooltip>
  );
}

export const StyledTooltip = styled.div`
  background: ${colors.offBlack};
  border-radius: 1px;
  padding: 2px 4px;
  position: absolute;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-0px);
  transition: opacity 300ms ease-in-out, transform 300ms ease-in-out;
`;

// When using the tooltip, Wrap the tooltip and target component with this parent.
export const StyledTooltipParent = styled.div<{ disabled?: boolean }>`
  ${({ disabled }) =>
    !disabled &&
    `
  &:hover {
    ${StyledTooltip} {
      opacity: 1;
      transform: translateY(6px);
    }
  }
  `}
`;
