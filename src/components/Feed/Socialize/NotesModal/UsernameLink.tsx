import styled from 'styled-components';
import Link from 'next/link';
import { TitleS } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import { ROUTES } from 'constants/routes';

type UsernameLinkProps = { username: string | null };

export function UsernameLink({ username }: UsernameLinkProps) {
  const link = username ? ROUTES.USER.ROOT(username) : '';
  return (
    <Link href={link}>
      <UsernameLinkWrapper href={link}>
        <TitleS>{username ?? '<unknown>'}</TitleS>
      </UsernameLinkWrapper>
    </Link>
  );
}

const UsernameLinkWrapper = styled.a`
  color: ${colors.offBlack};
  text-decoration: none;
`;
