import unescape from 'lodash/unescape';
import { graphql, useFragment } from 'react-relay';

import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeM } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { PostHeaderFragment$key } from '~/generated/PostHeaderFragment.graphql';
import { PostHeaderQueryFragment$key } from '~/generated/PostHeaderQueryFragment.graphql';
import { getTimeSince } from '~/shared/utils/time';
import handleCustomDisplayName from '~/utils/handleCustomDisplayName';

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
        author {
          ... on GalleryUser {
            username
            ...ProfilePictureFragment
            ...HoverCardOnUsernameFragment
          }
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

  const displayName = handleCustomDisplayName(post.author?.username ?? '');

  return (
    <VStack gap={6}>
      <HStack justify="space-between">
        <HoverCardOnUsername userRef={post.author}>
          <HStack align="center" gap={6}>
            <ProfilePicture userRef={post.author} size="md" />
            <VStack>
              <TitleDiatypeM>{displayName}</TitleDiatypeM>
            </VStack>
          </HStack>
        </HoverCardOnUsername>
        <HStack align="center" gap={4}>
          <StyledTime>{getTimeSince(post.creationTime)}</StyledTime>
          <PostDropdown postRef={post} queryRef={query} />
        </HStack>
      </HStack>
      <BaseM>{post.caption && <Markdown text={unescape(post.caption)}></Markdown>}</BaseM>
    </VStack>
  );
}
