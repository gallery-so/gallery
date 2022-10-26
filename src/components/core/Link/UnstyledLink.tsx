import Link from 'next/link';
import styled from 'styled-components';
import { InternalAnchorElementProps } from 'types/Elements';

// TODO:
// - handle rel="noopener noreferrer" for target="_blank" links

export const UnstyledLink = ({ href, ...props }: InternalAnchorElementProps) => (
  <Link href={href} passHref>
    <UnstyledAnchor {...props} />
  </Link>
);

export const UnstyledAnchor = styled.a`
  display: inherit;
  color: inherit;
  text-decoration: inherit;
`;
