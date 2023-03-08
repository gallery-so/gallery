import Link, { LinkProps } from 'next/link';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import { BaseM } from '~/components/core/Text/Text';
import { useDrawerActions } from '~/contexts/globalLayout/GlobalSidebar/SidebarDrawerContext';
import { UserSearchResultFragment$key } from '~/generated/UserSearchResultFragment.graphql';

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
    <StyledResult href={route} onClick={hideDrawer}>
      <StyledResultTitle>{user.username}</StyledResultTitle>
      <BaseM>{user.bio}</BaseM>
    </StyledResult>
  );
}

const StyledResult = styled(Link)<LinkProps>`
  color: ${colors.offBlack};
  padding: 16px 12px;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    background-color: ${colors.faint};
    border-radius: 4px;
  }
`;
const StyledResultTitle = styled(BaseM)`
  font-weight: 700;
`;
