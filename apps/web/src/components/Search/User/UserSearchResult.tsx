import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import Markdown from '~/components/core/Markdown/Markdown';
import { BaseM } from '~/components/core/Text/Text';
import { useDrawerActions } from '~/contexts/globalLayout/GlobalSidebar/SidebarDrawerContext';
import { UserSearchResultFragment$key } from '~/generated/UserSearchResultFragment.graphql';

import { StyledSearchResult, StyledSearchResultTitle } from '../SearchStyles';

type Props = {
  userRef: UserSearchResultFragment$key;
};

export default function UserSearchResult({ userRef }: Props) {
  const user = useFragment(
    graphql`
      fragment UserSearchResultFragment on GalleryUser {
        username
        bio
      }
    `,
    userRef
  );

  const { hideDrawer } = useDrawerActions();

  const route = {
    pathname: '/[username]',
    query: { username: user.username as string },
  };

  return (
    <StyledSearchResult href={route} onClick={hideDrawer}>
      <StyledSearchResultTitle>{user.username}</StyledSearchResultTitle>
      <StyledBio>
        <BaseM>
          <Markdown text={user.bio ?? ''} />
        </BaseM>
      </StyledBio>
    </StyledSearchResult>
  );
}

const StyledBio = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  -webkit-box-pack: end;
  p {
    display: inline;
  }
`;
