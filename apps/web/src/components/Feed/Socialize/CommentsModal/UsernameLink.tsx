import { Route } from 'nextjs-routes';

import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import { TitleS } from '~/components/core/Text/Text';

type UsernameLinkProps = { username: string | null };

export function UsernameLink({ username }: UsernameLinkProps) {
  const link: Route = username
    ? { pathname: '/[username]', query: { username } }
    : { pathname: '/' };

  return (
    <InteractiveLink to={link}>
      <TitleS as="span">{username ?? '<unknown>'}</TitleS>
    </InteractiveLink>
  );
}
