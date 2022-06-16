import colors from 'components/core/colors';
import { BaseS } from 'components/core/Text/Text';
import styled from 'styled-components';

type Props = {
  text: string;
  className?: string;
  dataTestId?: string;
};

export default function Tooltip({ text, className, dataTestId }: Props) {
  return (
    <StyledTooltip className={className} data-testid={dataTestId}>
      <StyledBaseS color={colors.white}>{text}</StyledBaseS>
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
  transition: opacity 300ms ease-in-out, transform 300ms ease-in-out;
`;

const StyledBaseS = styled(BaseS)`
  white-space: nowrap;
`;
