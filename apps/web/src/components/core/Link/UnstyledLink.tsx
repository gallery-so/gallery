import styled from 'styled-components';

import { InternalAnchorElementProps } from '~/types/Elements';

import InteractiveLink from '../InteractiveLink/InteractiveLink';

export const UnstyledLink = ({ href, children, ...props }: InternalAnchorElementProps) => (
  <InteractiveLink to={href} {...props}>
    {children}
  </InteractiveLink>
);

export const UnstyledAnchor = styled.a`
  display: inherit;
  color: inherit;
  text-decoration: inherit;
`;
