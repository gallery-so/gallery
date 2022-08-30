import colors from 'components/core/colors';
import { TitleXSBold } from 'components/core/Text/Text';
import styled from 'styled-components';

type Props = {
  text: string;
  className?: string;
  dataTestId?: string;
  whiteSpace?: 'nowrap' | 'normal';
};

export default function Tooltip({ text, className, dataTestId, whiteSpace = 'nowrap' }: Props) {
  return (
    <StyledTooltip className={className} data-testid={dataTestId}>
      <StyledTitleXSBold color={colors.white} whitespace={whiteSpace}>
        {text}
      </StyledTitleXSBold>
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

const StyledTitleXSBold = styled(TitleXSBold)<{ whitespace: string }>`
  white-space: ${({ whitespace }) => whitespace};
`;
