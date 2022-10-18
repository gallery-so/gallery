import { BODY_FONT_FAMILY } from 'components/core/Text/Text';
import styled from 'styled-components';
import colors from 'components/core/colors';

export const NavbarLink = styled.a<{ active: boolean }>`
  font-family: ${BODY_FONT_FAMILY};
  font-weight: 500;
  font-size: 18px;
  line-height: 21px;
  margin: 0;

  color: ${({ active }) => (active ? colors.offBlack : colors.metal)};

  cursor: pointer;
  text-decoration: none;
`;
