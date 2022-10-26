import styled from 'styled-components';
import Link from 'next/link';
import { TitleS } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import { route, Route } from 'nextjs-routes';

type UsernameLinkProps = { username: string | null };

export function UsernameLink({ username }: UsernameLinkProps) {
  const link: Route = username
    ? { pathname: '/[username]', query: { username } }
    : { pathname: '/' };
  return (
    <Link href={link}>
      <UsernameLinkWrapper href={route(link)}>
        <TitleS>{username ?? '<unknown>'}</TitleS>
      </UsernameLinkWrapper>
    </Link>
  );
}

const UsernameLinkWrapper = styled.a`
  color: ${colors.offBlack};
  text-decoration: none;
`;
