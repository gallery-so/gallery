import { InternalAnchorElementProps } from '~/types/Elements';

import GalleryLink from '../GalleryLink/GalleryLink';

export const UnstyledLink = ({ href, children, ...props }: InternalAnchorElementProps) => (
  <GalleryLink to={href} {...props}>
    {children}
  </GalleryLink>
);
