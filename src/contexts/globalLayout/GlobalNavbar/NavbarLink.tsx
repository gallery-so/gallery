import Link from 'next/link';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import colors from '~/components/core/colors';
import { BODY_FONT_FAMILY } from '~/components/core/Text/Text';

export const NavbarLink = styled(Link)`
  font-family: ${BODY_FONT_FAMILY};
  line-height: 21px;
  letter-spacing: -0.04em;
  font-weight: 500;
  font-size: 16px;

  @media only screen and ${breakpoints.tablet} {
    font-size: 18px;
  }

  margin: 0;

  color: ${({ active }) => (active ? colors.offBlack : colors.metal)};

  cursor: pointer;
  text-decoration: none;
`;
