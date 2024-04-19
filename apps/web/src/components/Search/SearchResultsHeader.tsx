import { PropsWithChildren } from 'react';
import styled from 'styled-components';

import colors from '~/shared/theme/colors';

import { TitleXS } from '../core/Text/Text';
import { SearchResultVariant } from './types';

type Props = PropsWithChildren<{
  variant?: SearchResultVariant;
}>;

export default function SearchResultsHeader({ variant = 'default', children }: Props) {
  return <StyledTitle variant={variant}>{children}</StyledTitle>;
}

const StyledTitle = styled(TitleXS)<{ variant?: SearchResultVariant }>`
  text-transform: uppercase;
  color: ${colors.metal};

  ${({ variant }) => variant === 'compact' && 'padding: 4px 0;'}
`;
