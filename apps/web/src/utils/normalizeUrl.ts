import { Route, route } from 'nextjs-routes';

export function normalizeUrl({ to, href }: { to?: Route | string; href?: string }) {
  let url = '';
  if (to) {
    if (typeof to === 'string') {
      url = to;
    } else {
      url = route(to);
    }
  }
  if (href) {
    url = href;
  }
  if (url.startsWith('/')) {
    url = `https://gallery.so${url}`;
  }
  return url;
}
