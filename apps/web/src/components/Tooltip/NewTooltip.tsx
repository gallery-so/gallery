import { ForwardedRef, forwardRef } from 'react';
import styled, { CSSProperties } from 'styled-components';

import colors from '~/shared/theme/colors';
import { BaseS, TitleXSBold } from '~/components/core/Text/Text';

type Props = {
  text: string;
  description?: string;
  className?: string;
  dataTestId?: string;
  whiteSpace?: 'nowrap' | 'normal';
  style?: CSSProperties;
} & Omit<JSX.IntrinsicElements['div'], 'ref'>;

function NewTooltip(
  { text, description, className, dataTestId, whiteSpace = 'nowrap', ...rest }: Props,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <StyledTooltip className={className} data-testid={dataTestId} ref={ref} {...rest}>
      <StyledTitleXSBold color={colors.white} whitespace={whiteSpace}>
        {text}
      </StyledTitleXSBold>
      {description && (
        <StyledBaseS color={colors.white} whitespace={whiteSpace}>
          {description}
        </StyledBaseS>
      )}
    </StyledTooltip>
  );
}

export const StyledTooltip = styled.div`
  background: ${colors.offBlack};
  border-radius: 1px;
  padding: 2px 4px;
  pointer-events: none;
  transition: opacity 300ms ease-in-out, transform 300ms ease-in-out;
`;

const StyledTitleXSBold = styled(TitleXSBold)<{ whitespace: string }>`
  white-space: ${({ whitespace }) => whitespace};
`;

const StyledBaseS = styled(BaseS)<{ whitespace: string }>`
  white-space: ${({ whitespace }) => whitespace};
`;

const ForwardedNewTooltip = forwardRef<HTMLDivElement, Props>(NewTooltip);

export { ForwardedNewTooltip as NewTooltip };
