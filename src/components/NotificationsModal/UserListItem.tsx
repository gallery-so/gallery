import { UserListItemFragment$key } from '__generated__/UserListItemFragment.graphql';
import Link from 'next/link';
import { Route } from 'nextjs-routes';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import Markdown from '~/components/core/Markdown/Markdown';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeM } from '~/components/core/Text/Text';
import { getFirstLine } from '~/utils/getFirstLine';

type UserListItemProps = {
  userRef: UserListItemFragment$key;
};

export function UserListItem({ userRef }: UserListItemProps) {
  const user = useFragment(
    graphql`
      fragment UserListItemFragment on GalleryUser {
        username @required(action: THROW)
        bio
      }
    `,
    userRef
  );

  const userRoute: Route = { pathname: '/[username]', query: { username: user.username } };

  return (
    <Link href={userRoute}>
      <StyledLink>
        <Container>
          <TitleDiatypeM>{user.username}</TitleDiatypeM>
          {user.bio && <BaseM>{user.bio && <Markdown text={getFirstLine(user.bio)} />}</BaseM>}
        </Container>
      </StyledLink>
    </Link>
  );
}

const StyledLink = styled.a`
  text-decoration: none;
`;

const Container = styled(VStack)`
  padding: 16px 12px;

  :hover {
    background-color: ${colors.faint};
  }
`;
