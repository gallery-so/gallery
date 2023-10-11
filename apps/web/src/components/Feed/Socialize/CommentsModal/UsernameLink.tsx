import { Route } from 'nextjs-routes';

import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import { TitleS } from '~/components/core/Text/Text';

type UsernameLinkProps = { username: string | null };

export function UsernameLink({ username }: UsernameLinkProps) {
  const link: Route = username
    ? { pathname: '/[username]', query: { username } }
    : { pathname: '/' };

  return (
    <GalleryLink to={link}>
      <TitleS as="span">{username ?? '<unknown>'}</TitleS>
    </GalleryLink>
  );
}
