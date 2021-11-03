import { ReactNode } from 'react';
import { Link } from '@reach/router';
import styled from 'styled-components';

type Props = {
  to?: string;
  href?: string;
  children: ReactNode;
  underlined?: boolean;
  underlineOnHover?: boolean;
};

export default function GalleryLink({ to, href, children, underlined = true, underlineOnHover = false }: Props) {
  if (!to && !href) {
    throw new Error('no link provided for GalleryLink');
  }

  if (to) {
    return (
      <StyledLink to={to} underlined={underlined} underlineOnHover={underlineOnHover}>
        {children}
      </StyledLink>
    );
  }

  if (href) {
    return (
      <StyledAnchor href={href} target="_blank" underlined={underlined} underlineOnHover={underlineOnHover}>{children}</StyledAnchor>
    );
  }

  return null;
}

type StyledProps = {
  underlineOnHover: boolean;
  underlined: boolean;
};

const StyledLink = styled(Link)<StyledProps>`
    color: inherit;
    ${({ underlined }) => !underlined && 'text-decoration: none;'} 

    &:hover {
      ${({ underlineOnHover }) => underlineOnHover && 'text-decoration: underline;'}
    }
`;

const StyledAnchor = styled.a<StyledProps>`
    color: inherit;
    ${({ underlined }) => !underlined && 'text-decoration: none;'} 

    &:hover {
      ${({ underlineOnHover }) => underlineOnHover && 'text-decoration: underline;'}
    }
`;
