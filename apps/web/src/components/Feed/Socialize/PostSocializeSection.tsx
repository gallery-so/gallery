import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { PostSocializeSectionFragment$key } from '~/generated/PostSocializeSectionFragment.graphql';
import { PostSocializeSectionQueryFragment$key } from '~/generated/PostSocializeSectionQueryFragment.graphql';
import useAdmirePost from '~/hooks/api/posts/useAdmirePost';
import useRemoveAdmirePost from '~/hooks/api/posts/useRemoveAdmirePost';
import useOptimisticUserInfo from '~/utils/useOptimisticUserInfo';

import { AdmireButton } from './AdmireButton';
import { AdmireLine } from './AdmireLine';
import { CommentBoxIcon } from './CommentBox/CommentBoxIcon';
import { Comments } from './Comments';

type Props = {
  onPotentialLayoutShift?: () => void;
  postRef: PostSocializeSectionFragment$key;
  queryRef: PostSocializeSectionQueryFragment$key;
};

export default function PostSocializeSection({ onPotentialLayoutShift, postRef, queryRef }: Props) {
  const post = useFragment(
    graphql`
      fragment PostSocializeSectionFragment on Post {
        __typename
        id
        dbid
        ...AdmireButtonFragment
        ...AdmireLineFragment
        ...CommentBoxIconFragment
        ...CommentsFragment
        ...AdmireLineFragment
      }
    `,
    postRef
  );

  const query = useFragment(
    graphql`
      fragment PostSocializeSectionQueryFragment on Query {
        ...useOptimisticUserInfoFragment
        ...AdmireButtonQueryFragment
        ...AdmireLineQueryFragment
        ...CommentBoxIconQueryFragment
        ...CommentsQueryFragment
      }
    `,
    queryRef
  );

  const [admirePost] = useAdmirePost();
  const [removeAdmirePost] = useRemoveAdmirePost();

  const info = useOptimisticUserInfo(query);

  const handleAdmireClick = useCallback(() => {
    admirePost(post.id, post.dbid, info);
  }, [admirePost, info, post.dbid, post.id]);

  return (
    <VStack gap={16}>
      <HStack justify="space-between" align="center" gap={24}>
        <AdmireLine eventRef={post} queryRef={query} onAdmire={handleAdmireClick} />

        <HStack align="center" gap={8}>
          <IconWrapper>
            <AdmireButton
              eventRef={post}
              queryRef={query}
              onAdmire={handleAdmireClick}
              onRemoveAdmire={removeAdmirePost}
            />
          </IconWrapper>

          <IconWrapper>
            <CommentBoxIcon eventRef={post} queryRef={query} />
          </IconWrapper>
        </HStack>
      </HStack>
      <HStack justify="space-between" align="flex-start" gap={24}>
        <VStack shrink>
          <Comments
            onPotentialLayoutShift={onPotentialLayoutShift}
            eventRef={post}
            queryRef={query}
          />
        </VStack>
      </HStack>
    </VStack>
  );
}
const IconWrapper = styled.div`
  position: relative;
`;
