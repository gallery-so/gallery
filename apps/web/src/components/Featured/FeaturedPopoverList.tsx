import Link from 'next/link';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { FeaturedPopoverListFragment$key } from '~/generated/FeaturedPopoverListFragment.graphql';
import { FeaturedPopoverListQueryFragment$key } from '~/generated/FeaturedPopoverListQueryFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';

import breakpoints from '../core/breakpoints';
import colors from '../core/colors';
import Markdown from '../core/Markdown/Markdown';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM, TitleDiatypeL, TitleDiatypeM } from '../core/Text/Text';
import FollowButton from '../Follow/FollowButton';

type Props = {
  featuredUsersRef: FeaturedPopoverListFragment$key;
  queryRef: FeaturedPopoverListQueryFragment$key;
};

export default function FeaturedPopoverList({ featuredUsersRef, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment FeaturedPopoverListQueryFragment on Query {
        ...FollowButtonQueryFragment
      }
    `,
    queryRef
  );

  const featuredUsers = useFragment(
    graphql`
      fragment FeaturedPopoverListFragment on GalleryUser @relay(plural: true) {
        id
        username
        bio
        ...FollowButtonUserFragment
      }
    `,
    featuredUsersRef
  );

  const isMobile = useIsMobileWindowWidth();

  return (
    <StyledList fullscreen={isMobile} gap={24}>
      <StyledHeading>Suggested curators for you</StyledHeading>
      <VStack>
        {featuredUsers.map((user) => (
          // @ts-expect-error This is the future next/link version
          <StyledRow legacyBehavior={false} key={user.id} href={`/${user.username}`}>
            <StyledHStack justify="space-between" align="center" gap={8}>
              <StyledVStack justify="center">
                <TitleDiatypeM>{user.username}</TitleDiatypeM>
                <StyledBio>{user.bio && <Markdown text={user.bio} />}</StyledBio>
              </StyledVStack>
              <StyledFollowButton userRef={user} queryRef={query} />
            </StyledHStack>
          </StyledRow>
        ))}
      </VStack>
    </StyledList>
  );
}

const StyledList = styled(VStack)<{ fullscreen: boolean }>`
  width: 375px;
  max-width: 375px;
  padding: 52px 8px 4px 4px;
  height: ${({ fullscreen }) => (fullscreen ? '100%' : '640px')};
`;

const StyledHeading = styled(TitleDiatypeL)`
  padding: 0px 8px;
`;

const StyledRow = styled(Link)`
  padding: 8px;
  text-decoration: none;
  min-height: 56px;
  max-height: 56px;

  &:hover {
    background: ${colors.offWhite};
  }
`;

const StyledHStack = styled(HStack)`
  height: 100%;
`;

const StyledVStack = styled(VStack)`
  width: 100%;
`;

const StyledBio = styled(BaseM)`
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;

  p {
    padding-bottom: 0;
  }
`;

const StyledFollowButton = styled(FollowButton)`
  padding: 2px 8px;
  width: 100%;

  @media only screen and ${breakpoints.desktop} {
    width: initial;
  }
`;
