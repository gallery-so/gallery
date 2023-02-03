import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { VStack } from '~/components/core/Spacer/Stack';
import { FEED_EVENT_ROW_WIDTH_DESKTOP } from '~/components/Feed/dimensions';
import { FeedEventData } from '~/components/Feed/FeedEventData';
import { FeedEventSocializeSection } from '~/components/Feed/Socialize/FeedEventSocializeSection';
import { ReportingErrorBoundary } from '~/contexts/boundary/ReportingErrorBoundary';
import { TriedToRenderUnsupportedFeedEvent } from '~/errors/TriedToRenderUnsupportedFeedEvent';
import { FeedEventFragment$key } from '~/generated/FeedEventFragment.graphql';
import { FeedEventQueryFragment$key } from '~/generated/FeedEventQueryFragment.graphql';
import { FeedEventWithErrorBoundaryFragment$key } from '~/generated/FeedEventWithErrorBoundaryFragment.graphql';
import { FeedEventWithErrorBoundaryQueryFragment$key } from '~/generated/FeedEventWithErrorBoundaryQueryFragment.graphql';

import colors from '../core/colors';
import { FeedMode } from './Feed';

type FeedEventProps = {
  eventRef: FeedEventFragment$key;
  queryRef: FeedEventQueryFragment$key;
  feedMode: FeedMode;
};

function FeedEvent({ eventRef, queryRef, feedMode }: FeedEventProps) {
  const event = useFragment(
    graphql`
      fragment FeedEventFragment on FeedEvent {
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
      fragment FeedEventQueryFragment on Query {
        ...FeedEventDataQueryFragment
      }
    `,
    queryRef
  );

  if (!event.eventData) {
    debugger;
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
      fragment FeedEventWithErrorBoundaryFragment on FeedEvent {
        eventData {
          ... on UserFollowedUsersFeedEventData {
            __typename
          }
        }

        ...FeedEventFragment
        ...FeedEventSocializeSectionFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment FeedEventWithErrorBoundaryQueryFragment on Query {
        ...FeedEventQueryFragment
        ...FeedEventSocializeSectionQueryFragment
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
      <FeedEventContainer gap={16}>
        <FeedEvent eventRef={event} queryRef={query} feedMode={feedMode} />

        {shouldShowAdmireComment && (
          // We have another boundary here in case the socialize section fails
          // and the rest of the feed event loads
          <ReportingErrorBoundary dontReport fallback={<></>}>
            <FeedEventSocializeSection
              eventRef={event}
              queryRef={query}
              onPotentialLayoutShift={handlePotentialLayoutShift}
            />
          </ReportingErrorBoundary>
        )}
      </FeedEventContainer>
    </ReportingErrorBoundary>
  );
}

const FeedEventContainer = styled(VStack)`
  margin: 0 auto;

  border-bottom: 1px solid ${colors.faint};

  padding: 24px 0px;

  cursor: pointer;

  @media only screen and ${breakpoints.desktop} {
    padding: 24px 16px;
    max-width: initial;
    width: ${FEED_EVENT_ROW_WIDTH_DESKTOP}px;
  }
`;
