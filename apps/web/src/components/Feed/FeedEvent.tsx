import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { VStack } from '~/components/core/Spacer/Stack';
import { FEED_EVENT_ROW_WIDTH_DESKTOP } from '~/components/Feed/dimensions';
import { FeedEventData } from '~/components/Feed/FeedEventData';
import { FeedEventSocializeSection } from '~/components/Feed/Socialize/FeedEventSocializeSection';
import { FeedMode } from '~/components/Feed/types';
import { FeedEventFragment$key } from '~/generated/FeedEventFragment.graphql';
import { FeedEventQueryFragment$key } from '~/generated/FeedEventQueryFragment.graphql';
import { FeedEventWithErrorBoundaryFragment$key } from '~/generated/FeedEventWithErrorBoundaryFragment.graphql';
import { FeedEventWithErrorBoundaryQueryFragment$key } from '~/generated/FeedEventWithErrorBoundaryQueryFragment.graphql';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import { TriedToRenderUnsupportedFeedEvent } from '~/shared/errors/TriedToRenderUnsupportedFeedEvent';
import colors from '~/shared/theme/colors';

import PostData from './Posts/PostData';
import PostSocializeSection from './Socialize/PostSocializeSection';

type FeedEventProps = {
  eventRef: FeedEventFragment$key;
  queryRef: FeedEventQueryFragment$key;
  feedMode: FeedMode;
};

function FeedEvent({ eventRef, queryRef, feedMode }: FeedEventProps) {
  const event = useFragment(
    graphql`
      fragment FeedEventFragment on FeedEventOrError {
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
      fragment FeedEventQueryFragment on Query {
        ...FeedEventDataQueryFragment
      }
    `,
    queryRef
  );

  if (event.__typename === 'Post') {
    return <PostData postRef={event} />;
  }

  if (event.__typename === 'FeedEvent') {
    if (!event.eventData) {
      throw new TriedToRenderUnsupportedFeedEvent(event.dbid);
    }

    return (
      <FeedEventData
        caption={event.caption}
        feedMode={feedMode}
        eventDbid={event.dbid}
        feedEventRef={event.eventData}
        queryRef={query}
      />
    );
  }

  return <></>;
}

type FeedEventWithBoundaryProps = {
  index: number;
  feedMode: FeedMode;
  onPotentialLayoutShift: (index: number) => void;
  eventRef: FeedEventWithErrorBoundaryFragment$key;
  queryRef: FeedEventWithErrorBoundaryQueryFragment$key;
};

export default function FeedEventWithBoundary({
  index,
  feedMode,
  eventRef,
  queryRef,
  onPotentialLayoutShift,
}: FeedEventWithBoundaryProps) {
  const event = useFragment(
    graphql`
      fragment FeedEventWithErrorBoundaryFragment on FeedEventOrError {
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
        ...FeedEventFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment FeedEventWithErrorBoundaryQueryFragment on Query {
        ...FeedEventQueryFragment
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
        <FeedEvent eventRef={event} queryRef={query} feedMode={feedMode} />

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

        <ReportingErrorBoundary dontReport fallback={<></>}></ReportingErrorBoundary>
      </FeedItemContainer>
    </ReportingErrorBoundary>
  );
}

const FeedItemContainer = styled(VStack)`
  margin: 0 auto;

  border-bottom: 1px solid ${colors.faint};

  padding: 24px 0px;

  @media only screen and ${breakpoints.desktop} {
    padding: 24px 16px;
    max-width: initial;
    width: ${FEED_EVENT_ROW_WIDTH_DESKTOP}px;
  }
`;
