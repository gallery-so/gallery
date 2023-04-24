import Link from 'next/link';
import { Route, route } from 'nextjs-routes';
import styled from 'styled-components';

import colors from '~/shared/theme/colors';
import { TitleS } from '~/components/core/Text/Text';

type UsernameLinkProps = { username: string | null };

export function UsernameLink({ username }: UsernameLinkProps) {
  const link: Route = username
    ? { pathname: '/[username]', query: { username } }
    : { pathname: '/' };
  return (
    <Link href={link} legacyBehavior>
      <UsernameLinkWrapper href={route(link)}>
        <TitleS as="span">{username ?? '<unknown>'}</TitleS>
      </UsernameLinkWrapper>
    </Link>
  );
}

const UsernameLinkWrapper = styled.a`
  color: ${colors.offBlack};
  text-decoration: none;
`;
