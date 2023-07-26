import { useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { AdmireButton } from '~/components/Feed/Socialize/AdmireButton';
import { CommentBoxIcon } from '~/components/Feed/Socialize/CommentBox/CommentBoxIcon';
import { Comments } from '~/components/Feed/Socialize/Comments';
import { FeedEventSocializeSectionFragment$key } from '~/generated/FeedEventSocializeSectionFragment.graphql';
import { FeedEventSocializeSectionQueryFragment$key } from '~/generated/FeedEventSocializeSectionQueryFragment.graphql';
import useAdmireFeedEvent from '~/hooks/api/feedEvents/useAdmireFeedEvent';
import useRemovedAdmireFeedEvent from '~/hooks/api/feedEvents/useRemoveAdmireFeedEvent';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';

import { AdmireLine } from './AdmireLine';

type FeedEventSocializeSectionProps = {
  onPotentialLayoutShift: () => void;
  eventRef: FeedEventSocializeSectionFragment$key;
  queryRef: FeedEventSocializeSectionQueryFragment$key;
};

export function FeedEventSocializeSection({
  eventRef,
  queryRef,
  onPotentialLayoutShift,
}: FeedEventSocializeSectionProps) {
  const event = useFragment(
    graphql`
      fragment FeedEventSocializeSectionFragment on FeedEvent {
        id
        dbid
        ...AdmireButtonFragment
        ...AdmireLineFragment
        ...CommentBoxIconFragment
        ...CommentsFragment
        ...AdmireLineFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment FeedEventSocializeSectionQueryFragment on Query {
        viewer {
          ... on Viewer {
            user {
              id
              dbid
              username
              profileImage {
                ... on TokenProfileImage {
                  token {
                    dbid
                    id
                    ...getVideoOrImageUrlForNftPreviewFragment
                  }
                }
              }
            }
          }
        }
        ...AdmireButtonQueryFragment
        ...AdmireLineQueryFragment
        ...CommentBoxIconQueryFragment
        ...CommentsQueryFragment
      }
    `,
    queryRef
  );

  const [admireFeedEvent] = useAdmireFeedEvent();
  const [removeAdmireFeedEvent] = useRemovedAdmireFeedEvent();

  const handleAdmireFeedEvent = useCallback(() => {
    const { token } = query.viewer?.user?.profileImage ?? {};
    const user = query.viewer?.user;
    if (!user) {
      return;
    }

    const result = token
      ? getVideoOrImageUrlForNftPreview({
          tokenRef: token,
        })
      : null;

    admireFeedEvent(event.id, event.dbid, {
      id: user.id,
      dbid: user.dbid,
      username: user.username ?? '',
      profileImageUrl: result?.urls?.small ?? '',
    });
  }, [admireFeedEvent, event.dbid, event.id, query.viewer?.user]);
  return (
    <VStack gap={4}>
      <HStack justify="space-between" align="center" gap={24}>
        <AdmireLine eventRef={event} queryRef={query} onAdmire={handleAdmireFeedEvent} />
        <HStack align="center" gap={8}>
          <IconWrapper>
            <AdmireButton
              eventRef={event}
              queryRef={query}
              onAdmire={handleAdmireFeedEvent}
              onRemoveAdmire={removeAdmireFeedEvent}
            />
          </IconWrapper>

          <IconWrapper>
            <CommentBoxIcon eventRef={event} queryRef={query} />
          </IconWrapper>
        </HStack>
      </HStack>
      <HStack justify="space-between" align="flex-start" gap={24}>
        <VStack shrink>
          <Comments
            onPotentialLayoutShift={onPotentialLayoutShift}
            eventRef={event}
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
