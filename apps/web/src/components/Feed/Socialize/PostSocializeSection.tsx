import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { PostSocializeSectionFragment$key } from '~/generated/PostSocializeSectionFragment.graphql';
import useAdmirePost from '~/hooks/api/posts/useAdmirePost';
import useRemoveAdmirePost from '~/hooks/api/posts/useRemoveAdmirePost';

import { AdmireButton } from './AdmireButton';
import { AdmireLine } from './AdmireLine';
import { CommentBoxIcon } from './CommentBox/CommentBoxIcon';
import { Comments } from './Comments';

type Props = {
  onPotentialLayoutShift: () => void;
  postRef: PostSocializeSectionFragment$key;
  queryRef: PostSocializeSectionFragment$key;
};

export default function PostSocializeSection({ onPotentialLayoutShift, postRef, queryRef }: Props) {
  const post = useFragment(
    graphql`
      fragment PostSocializeSectionFragment on Post {
        __typename
        ...AdmireButtonFragment
        ...AdmireLineFragment
        ...CommentBoxIconFragment
        ...CommentsFragment

        # We only show 1 but in case the user deletes something
        # we want to be sure that we can show another comment beneath
        admires(last: 5) @connection(key: "Interactions_admires") {
          edges {
            node {
              __typename
            }
          }
        }
        ...AdmireLineFragment
      }
    `,
    postRef
  );

  const query = useFragment(
    graphql`
      fragment PostSocializeSectionQueryFragment on Query {
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

  const nonNullAdmires = useMemo(() => {
    const admires = [];

    for (const edge of post.admires?.edges ?? []) {
      if (edge?.node) {
        admires.push(edge.node);
      }
    }

    admires.reverse();

    return admires;
  }, [post.admires?.edges]);

  return (
    <VStack gap={4}>
      <HStack justify="space-between" align="center" gap={24}>
        <div>{nonNullAdmires.length > 0 && <AdmireLine eventRef={post} queryRef={query} />}</div>
        <HStack align="center">
          <IconWrapper>
            <AdmireButton
              eventRef={post}
              queryRef={query}
              onAdmire={admirePost}
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
