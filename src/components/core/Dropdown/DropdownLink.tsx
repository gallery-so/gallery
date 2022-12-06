import Link from 'next/link';
import { Route, route } from 'nextjs-routes';
import { ReactNode } from 'react';
import styled from 'styled-components';

import colors from '~/components/core/colors';

type DropdownLinkProps = { href: Route; children: ReactNode; onClick?: () => void };

export function DropdownLink({ href, children, onClick }: DropdownLinkProps) {
  return (
    <Link prefetch={false} href={href} onClick={onClick}>
      <StyledDropdownLink href={route(href)}>{children}</StyledDropdownLink>
    </Link>
  );
}

const StyledDropdownLink = styled.a`
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
    color: ${colors.offBlack};
    background-color: ${colors.faint};
  }
`;
