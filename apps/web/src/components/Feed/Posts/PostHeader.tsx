import unescape from 'lodash/unescape';
import { graphql, useFragment } from 'react-relay';

import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { PostHeaderFragment$key } from '~/generated/PostHeaderFragment.graphql';
import { PostHeaderQueryFragment$key } from '~/generated/PostHeaderQueryFragment.graphql';
import { getTimeSince } from '~/shared/utils/time';

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

  return (
    <VStack gap={6}>
      <HStack justify="space-between">
        <HStack align="center" gap={6}>
          <HoverCardOnUsername userRef={post.author}>
            <ProfilePicture userRef={post.author} size="md" />
          </HoverCardOnUsername>
          <VStack>
            <HoverCardOnUsername userRef={post.author} />
          </VStack>
        </HStack>
        <HStack align="center" gap={4}>
          <StyledTime>{getTimeSince(post.creationTime)}</StyledTime>
          <PostDropdown postRef={post} queryRef={query} />
        </HStack>
      </HStack>
      <BaseM>{post.caption && <Markdown text={unescape(post.caption)}></Markdown>}</BaseM>
    </VStack>
  );
}
