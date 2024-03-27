import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { VStack } from '~/components/core/Spacer/Stack';
import { FEED_EVENT_ROW_WIDTH_DESKTOP } from '~/components/Feed/dimensions';
import { FeedEventData } from '~/components/Feed/FeedEventData';
import { FeedEventSocializeSection } from '~/components/Feed/Socialize/FeedEventSocializeSection';
import { FeedMode } from '~/components/Feed/types';
import { FeedEventItemFragment$key } from '~/generated/FeedEventItemFragment.graphql';
import { FeedEventItemQueryFragment$key } from '~/generated/FeedEventItemQueryFragment.graphql';
import { FeedEventItemWithErrorBoundaryFragment$key } from '~/generated/FeedEventItemWithErrorBoundaryFragment.graphql';
import { FeedEventItemWithErrorBoundaryQueryFragment$key } from '~/generated/FeedEventItemWithErrorBoundaryQueryFragment.graphql';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import { TriedToRenderUnsupportedFeedEvent } from '~/shared/errors/TriedToRenderUnsupportedFeedEvent';

type FeedEventItemProps = {
  eventRef: FeedEventItemFragment$key;
  queryRef: FeedEventItemQueryFragment$key;
  feedMode: FeedMode;
};

function FeedEventItem({ eventRef, queryRef, feedMode }: FeedEventItemProps) {
  const feedEvent = useFragment(
    graphql`
      fragment FeedEventItemFragment on FeedEvent {
        __typename
        dbid
        caption
        eventData {
          ...FeedEventDataFragment
        }
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment FeedEventItemQueryFragment on Query {
        ...FeedEventDataQueryFragment
      }
    `,
    queryRef
  );

  if (feedEvent.__typename === 'FeedEvent') {
    if (!feedEvent.eventData) {
      throw new TriedToRenderUnsupportedFeedEvent(feedEvent.dbid);
    }

    return (
      <FeedEventData
        caption={feedEvent.caption}
        feedMode={feedMode}
        eventDbid={feedEvent.dbid}
        feedEventRef={feedEvent.eventData}
        queryRef={query}
      />
    );
  }

  return <></>;
}

type FeedEventItemWithBoundaryProps = {
  index: number;
  feedMode: FeedMode;
  onPotentialLayoutShift: (index: number) => void;
  eventRef: FeedEventItemWithErrorBoundaryFragment$key;
  queryRef: FeedEventItemWithErrorBoundaryQueryFragment$key;
};

export default function FeedEventItemWithBoundary({
  index,
  feedMode,
  eventRef,
  queryRef,
  onPotentialLayoutShift,
}: FeedEventItemWithBoundaryProps) {
  const event = useFragment(
    graphql`
      fragment FeedEventItemWithErrorBoundaryFragment on FeedEvent {
        eventData {
          ... on UserFollowedUsersFeedEventData {
            __typename
          }
          ... on GalleryUpdatedFeedEventData {
            subEventDatas {
              __typename
            }
          }
        }
        ...FeedEventSocializeSectionFragment
        ...FeedEventItemFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment FeedEventItemWithErrorBoundaryQueryFragment on Query {
        ...FeedEventItemQueryFragment
        ...FeedEventSocializeSectionQueryFragment
      }
    `,
    queryRef
  );

  const shouldShowAdmireComment = event.eventData?.__typename !== 'UserFollowedUsersFeedEventData';

  const handlePotentialLayoutShift = useCallback(() => {
    onPotentialLayoutShift(index);
  }, [index, onPotentialLayoutShift]);

  // check that subEvents is non-empty
  if (event.eventData?.__typename !== 'UserFollowedUsersFeedEventData') {
    // ignore GalleryInfoUpdatedFeedEventData events because we have no component to handle that right now
    const subEvents = event?.eventData?.subEventDatas
      ?.slice(0, 4)
      .filter((event) => event.__typename !== 'GalleryInfoUpdatedFeedEventData');

    if (!subEvents?.length) {
      return null;
    }
  }

  return (
    <ReportingErrorBoundary fallback={<></>}>
      <FeedEventItemContainer gap={16}>
        <FeedEventItem eventRef={event} queryRef={query} feedMode={feedMode} />

        {/* // We have another boundary here in case the socialize section fails
          // and the rest of the feed event loads */}
        <ReportingErrorBoundary dontReport fallback={<></>}>
          {shouldShowAdmireComment && (
            <FeedEventSocializeSection
              eventRef={event}
              queryRef={query}
              onPotentialLayoutShift={handlePotentialLayoutShift}
            />
          )}
        </ReportingErrorBoundary>
      </FeedEventItemContainer>
    </ReportingErrorBoundary>
  );
}

const FeedEventItemContainer = styled(VStack)`
  margin: 0 auto;

  padding: 24px 0px;

  @media only screen and ${breakpoints.desktop} {
    padding: 24px 0px;
    max-width: initial;
    width: ${FEED_EVENT_ROW_WIDTH_DESKTOP}px;
  }
`;
