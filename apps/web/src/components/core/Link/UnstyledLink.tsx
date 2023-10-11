import styled from 'styled-components';

import { InternalAnchorElementProps } from '~/types/Elements';

import GalleryLink from '../GalleryLink/GalleryLink';

export const UnstyledLink = ({ href, children, ...props }: InternalAnchorElementProps) => (
  <GalleryLink to={href} {...props}>
    {children}
  </GalleryLink>
);

export const UnstyledAnchor = styled.a`
  display: inherit;
  color: inherit;
  text-decoration: inherit;
`;
