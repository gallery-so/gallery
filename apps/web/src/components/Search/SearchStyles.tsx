import Link, { LinkProps } from 'next/link';
import styled from 'styled-components';

import colors from '../core/colors';
import { BaseM } from '../core/Text/Text';

export const StyledSearchResult = styled(Link)<LinkProps>`
  color: ${colors.offBlack};
  padding: 16px 12px;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    background-color: ${colors.faint};
    border-radius: 4px;
  }
`;

export const StyledSearchResultTitle = styled(BaseM)`
  font-weight: 700;
`;
