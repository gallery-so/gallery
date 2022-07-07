import Link from 'next/link';
import { AnchorHTMLAttributes } from 'react';
import styled from 'styled-components';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

export const UnstyledLink = ({ href, ...props }: Props) => (
  <Link href={href} passHref>
    <StyledLink {...props} />
  </Link>
);

export const StyledLink = styled.a`
  display: inherit;
  color: inherit;
  text-decoration: inherit;
`;
