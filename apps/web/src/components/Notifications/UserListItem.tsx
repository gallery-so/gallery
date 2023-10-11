import { Route } from 'nextjs-routes';
import { useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import Markdown from '~/components/core/Markdown/Markdown';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeM } from '~/components/core/Text/Text';
import { useDrawerActions } from '~/contexts/globalLayout/GlobalSidebar/SidebarDrawerContext';
import { UserListItemFragment$key } from '~/generated/UserListItemFragment.graphql';
import colors from '~/shared/theme/colors';

import GalleryLink from '../core/GalleryLink/GalleryLink';

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

  const { hideDrawer } = useDrawerActions();

  const handleLinkClick = useCallback(() => {
    hideDrawer();
  }, [hideDrawer]);

  return (
    <GalleryLink onClick={handleLinkClick} to={userRoute}>
      <Container>
        <TitleDiatypeM>{user.username}</TitleDiatypeM>
        {user.bio && <BioText>{user.bio && <Markdown text={user.bio} />}</BioText>}
      </Container>
    </GalleryLink>
  );
}

const BioText = styled(BaseM)`
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;

  p {
    padding-bottom: 0;
  }
`;

const Container = styled(VStack)`
  padding: 16px 12px;

  :hover {
    background-color: ${colors.faint};
  }
`;
