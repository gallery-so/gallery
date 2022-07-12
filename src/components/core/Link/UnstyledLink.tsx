import Link from 'next/link';
import { AnchorHTMLAttributes } from 'react';
import styled from 'styled-components';

// TODO:
// - handle rel="noopener noreferrer" for target="_blank" links

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

export const UnstyledLink = ({ href, ...props }: Props) => (
  <Link href={href} passHref>
    <UnstyledAnchor {...props} />
  </Link>
);

export const UnstyledAnchor = styled.a`
  display: inherit;
  color: inherit;
  text-decoration: inherit;
`;
