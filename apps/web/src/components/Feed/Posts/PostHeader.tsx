import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, BaseS } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { PostHeaderFragment$key } from '~/generated/PostHeaderFragment.graphql';
import { PostHeaderQueryFragment$key } from '~/generated/PostHeaderQueryFragment.graphql';
import colors from '~/shared/theme/colors';
import { getTimeSince } from '~/shared/utils/time';
import { getCommunityUrlForToken } from '~/utils/getCommunityUrlForToken';

import { StyledTime } from '../Events/EventStyles';
import PostDropdown from './PostDropdown';

type Props = {
  postRef: PostHeaderFragment$key;
  queryRef: PostHeaderQueryFragment$key;
};

export default function PostHeader({ postRef, queryRef }: Props) {
  const post = useFragment(
    graphql`
      fragment PostHeaderFragment on Post {
        __typename
        caption
        author @required(action: THROW) {
          ... on GalleryUser {
            ...ProfilePictureFragment
            ...HoverCardOnUsernameFragment
          }
        }
        tokens {
          community {
            name
          }
          ...getCommunityUrlForTokenFragment
        }
        creationTime
        ...PostDropdownFragment
      }
    `,
    postRef
  );

  const query = useFragment(
    graphql`
      fragment PostHeaderQueryFragment on Query {
        ...PostDropdownQueryFragment
      }
    `,
    queryRef
  );

  const token = post.tokens && post.tokens[0];
  const communityUrl = token ? getCommunityUrlForToken(token) : null;

  return (
    <VStack gap={6}>
      <HStack justify="space-between">
        <HStack align="center" gap={6}>
          <ProfilePicture userRef={post.author} size="md" />
          <VStack>
            <HoverCardOnUsername userRef={post.author} />
            {communityUrl ? (
              <StyledInteractiveLink to={communityUrl}>
                <BaseS color={colors.shadow}>{token?.community?.name}</BaseS>
              </StyledInteractiveLink>
            ) : (
              <BaseS color={colors.shadow}>{token?.community?.name}</BaseS>
            )}
          </VStack>
        </HStack>
        <HStack align="center" gap={4}>
          <StyledTime>{getTimeSince(post.creationTime)}</StyledTime>
          <PostDropdown postRef={post} queryRef={query} />
        </HStack>
      </HStack>
      <StyledCaption>{post.caption}</StyledCaption>
    </VStack>
  );
}

const StyledInteractiveLink = styled(InteractiveLink)`
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const StyledCaption = styled(BaseM)`
  overflow-wrap: break-word;
  font-size: 16px;
`;
