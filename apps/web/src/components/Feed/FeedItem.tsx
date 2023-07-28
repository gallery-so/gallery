import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { VStack } from '~/components/core/Spacer/Stack';
import { FEED_EVENT_ROW_WIDTH_DESKTOP } from '~/components/Feed/dimensions';
import { FeedEventData } from '~/components/Feed/FeedEventData';
import { FeedEventSocializeSection } from '~/components/Feed/Socialize/FeedEventSocializeSection';
import { FeedMode } from '~/components/Feed/types';
import { FeedItemFragment$key } from '~/generated/FeedItemFragment.graphql';
import { FeedItemQueryFragment$key } from '~/generated/FeedItemQueryFragment.graphql';
import { FeedItemWithErrorBoundaryFragment$key } from '~/generated/FeedItemWithErrorBoundaryFragment.graphql';
import { FeedItemWithErrorBoundaryQueryFragment$key } from '~/generated/FeedItemWithErrorBoundaryQueryFragment.graphql';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import { TriedToRenderUnsupportedFeedEvent } from '~/shared/errors/TriedToRenderUnsupportedFeedEvent';

import PostData from './Posts/PostData';
import PostSocializeSection from './Socialize/PostSocializeSection';

type FeedItemProps = {
  eventRef: FeedItemFragment$key;
  queryRef: FeedItemQueryFragment$key;
  feedMode: FeedMode;
};

// Not to be confused with the FeedEvent type. This component can render both FeedEvent and Post types, and represents a single item in the feed.
function FeedItem({ eventRef, queryRef, feedMode }: FeedItemProps) {
  const postOrFeedEvent = useFragment(
    graphql`
      fragment FeedItemFragment on FeedEventOrError {
        ... on FeedEvent {
          __typename
          dbid
          caption
          eventData {
            ...FeedEventDataFragment
          }
        }
        ... on Post {
          __typename
          ...PostDataFragment
        }
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment FeedItemQueryFragment on Query {
        ...FeedEventDataQueryFragment
      }
    `,
    queryRef
  );

  if (postOrFeedEvent.__typename === 'Post') {
    return <PostData postRef={postOrFeedEvent} />;
  }

  if (postOrFeedEvent.__typename === 'FeedEvent') {
    if (!postOrFeedEvent.eventData) {
      throw new TriedToRenderUnsupportedFeedEvent(postOrFeedEvent.dbid);
    }

    return (
      <FeedEventData
        caption={postOrFeedEvent.caption}
        feedMode={feedMode}
        eventDbid={postOrFeedEvent.dbid}
        feedEventRef={postOrFeedEvent.eventData}
        queryRef={query}
      />
    );
  }

  return <></>;
}

type FeedItemWithBoundaryProps = {
  index: number;
  feedMode: FeedMode;
  onPotentialLayoutShift: (index: number) => void;
  eventRef: FeedItemWithErrorBoundaryFragment$key;
  queryRef: FeedItemWithErrorBoundaryQueryFragment$key;
};

export default function FeedItemWithBoundary({
  index,
  feedMode,
  eventRef,
  queryRef,
  onPotentialLayoutShift,
}: FeedItemWithBoundaryProps) {
  const event = useFragment(
    graphql`
      fragment FeedItemWithErrorBoundaryFragment on FeedEventOrError {
        __typename
        ... on FeedEvent {
          eventData {
            ... on UserFollowedUsersFeedEventData {
              __typename
            }
          }
          ...FeedEventSocializeSectionFragment
        }
        ... on Post {
          ...PostSocializeSectionFragment
        }
        ...FeedItemFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment FeedItemWithErrorBoundaryQueryFragment on Query {
        ...FeedItemQueryFragment
        ...FeedEventSocializeSectionQueryFragment
        ...PostSocializeSectionQueryFragment
      }
    `,
    queryRef
  );

  const shouldShowAdmireComment = event.eventData?.__typename !== 'UserFollowedUsersFeedEventData';

  const handlePotentialLayoutShift = useCallback(() => {
    onPotentialLayoutShift(index);
  }, [index, onPotentialLayoutShift]);

  return (
    <ReportingErrorBoundary fallback={<></>}>
      <FeedItemContainer gap={16}>
        <FeedItem eventRef={event} queryRef={query} feedMode={feedMode} />

        {/* // We have another boundary here in case the socialize section fails
          // and the rest of the feed event loads */}
        <ReportingErrorBoundary dontReport fallback={<></>}>
          {event.__typename === 'Post' && (
            <PostSocializeSection
              queryRef={query}
              postRef={event}
              onPotentialLayoutShift={handlePotentialLayoutShift}
            />
          )}
          {event.__typename === 'FeedEvent' && shouldShowAdmireComment && (
            <FeedEventSocializeSection
              eventRef={event}
              queryRef={query}
              onPotentialLayoutShift={handlePotentialLayoutShift}
            />
          )}
        </ReportingErrorBoundary>
      </FeedItemContainer>
    </ReportingErrorBoundary>
  );
}

const FeedItemContainer = styled(VStack)`
  margin: 0 auto;

  padding: 24px 0px;

  @media only screen and ${breakpoints.desktop} {
    padding: 24px 16px;
    max-width: initial;
    width: ${FEED_EVENT_ROW_WIDTH_DESKTOP}px;
  }
`;
