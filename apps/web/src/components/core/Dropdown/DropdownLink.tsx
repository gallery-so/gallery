import { Route } from 'nextjs-routes';
import { ReactNode } from 'react';
import styled from 'styled-components';

import colors from '~/shared/theme/colors';

import GalleryLink from '../GalleryLink/GalleryLink';

type DropdownLinkProps = { href: Route; children: ReactNode; onClick?: () => void };

export function DropdownLink({ href, children, onClick }: DropdownLinkProps) {
  return (
    <StyledDropdownItem to={href} onClick={onClick}>
      {children}
    </StyledDropdownItem>
  );
}

const StyledDropdownItem = styled(GalleryLink)`
  padding: 8px;

  font-family: 'Helvetica Neue';
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;

  color: #808080;
  cursor: pointer;
  text-decoration: none;

  white-space: nowrap;

  :hover {
    color: ${colors.black['800']};
    background-color: ${colors.faint};
  }
`;
