import { Route } from 'nextjs-routes';
import { ReactNode } from 'react';
import styled from 'styled-components';

import colors from '~/shared/theme/colors';

import GalleryLink from '../GalleryLink/GalleryLink';
import { BODY_FONT_FAMILY } from '../Text/Text';
import transitions from '../transitions';

type Props = {
  to?: Route;
  href?: string;
  children: ReactNode;
  dataTestId?: string;
  className?: string;
  onClick?: () => void;
};

export default function NavLink({ to, href, children, className, onClick }: Props) {
  return (
    <StyledNavLink className={className} to={to} href={href} onClick={onClick}>
      {children}
    </StyledNavLink>
  );
}

const StyledNavLink = styled(GalleryLink)`
  color: inherit;
  text-decoration: none;
  font-family: ${BODY_FONT_FAMILY};
  font-size: 12px;
  line-height: 16px;
  color: ${colors.shadow};
  transition: color ${transitions.cubic};

  &:hover {
    color: ${colors.black['800']};
  }
`;
