import unescape from 'lodash/unescape';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeM } from '~/components/core/Text/Text';
import UserHoverCard from '~/components/HoverCard/UserHoverCard';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { PostHeaderFragment$key } from '~/generated/PostHeaderFragment.graphql';
import { PostHeaderQueryFragment$key } from '~/generated/PostHeaderQueryFragment.graphql';
import { replaceUrlsWithMarkdownFormat } from '~/shared/utils/replaceUrlsWithMarkdownFormat';
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
        author @required(action: THROW) {
          ... on GalleryUser {
            username
            ...ProfilePictureFragment
            ...UserHoverCardFragment
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
        <UserHoverCard
          userRef={post.author}
          HoverableElement={
            <HStack align="center" gap={6}>
              <ProfilePicture userRef={post.author} size="md" />
              <VStack>
                <TitleDiatypeM>{displayName}</TitleDiatypeM>
              </VStack>
            </HStack>
          }
        />
        <HStack align="center" gap={4}>
          <StyledTime>{getTimeSince(post.creationTime)}</StyledTime>
          <PostDropdown postRef={post} queryRef={query} />
        </HStack>
      </HStack>
      <StyledBaseM>
        {post.caption && (
          <Markdown text={unescape(replaceUrlsWithMarkdownFormat(post.caption))}></Markdown>
        )}
      </StyledBaseM>
    </VStack>
  );
}

const StyledBaseM = styled(BaseM)`
  word-wrap: break-word;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;
