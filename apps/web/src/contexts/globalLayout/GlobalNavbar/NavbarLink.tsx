import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import { BaseS, BODY_FONT_FAMILY } from '~/components/core/Text/Text';
import colors from '~/shared/theme/colors';

// legacyBehavior: false ensures these styles are applied to the link element
export const NavbarLink = styled(InteractiveLink).attrs({ legacyBehavior: false })<{
  active: boolean;
}>`
  font-family: ${BODY_FONT_FAMILY};
  line-height: 21px;
  letter-spacing: -0.04em;
  font-weight: 500;
  font-size: 16px;

  @media only screen and ${breakpoints.tablet} {
    font-size: 18px;
  }

  margin: 0;

  color: ${({ active }) => (active ? colors.black['800'] : colors.metal)};

  cursor: pointer;
  text-decoration: none;

  ${BaseS} {
    color: ${({ active }) => (active ? colors.black['800'] : colors.metal)};
  }
`;
