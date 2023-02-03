import { Route } from 'nextjs-routes';
import { AnchorHTMLAttributes } from 'react';

export type AnchorElementProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export type ExternalAnchorElementProps = AnchorElementProps & {
  href: string;
};

export type InternalAnchorElementProps = Omit<AnchorElementProps, 'href'> & {
  href: Route;
};
