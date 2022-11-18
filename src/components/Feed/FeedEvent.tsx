import { ErrorBoundary } from '@sentry/nextjs';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { VStack } from '~/components/core/Spacer/Stack';
import { FEED_EVENT_ROW_WIDTH_DESKTOP } from '~/components/Feed/dimensions';
import { FeedEventSocializeSection } from '~/components/Feed/Socialize/FeedEventSocializeSection';
import { FeedEventFragment$key } from '~/generated/FeedEventFragment.graphql';
import { FeedEventQueryFragment$key } from '~/generated/FeedEventQueryFragment.graphql';
import { FeedEventWithErrorBoundaryFragment$key } from '~/generated/FeedEventWithErrorBoundaryFragment.graphql';
import { FeedEventWithErrorBoundaryQueryFragment$key } from '~/generated/FeedEventWithErrorBoundaryQueryFragment.graphql';
import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';
import unescape from '~/utils/unescape';

import colors from '../core/colors';
import CollectionCreatedFeedEvent from './Events/CollectionCreatedFeedEvent';
import CollectionUpdatedFeedEvent from './Events/CollectionUpdatedFeedEvent';
import CollectorsNoteAddedToCollectionFeedEvent from './Events/CollectorsNoteAddedToCollectionFeedEvent';
import CollectorsNoteAddedToTokenFeedEvent from './Events/CollectorsNoteAddedToTokenFeedEvent';
import TokensAddedToCollectionFeedEvent from './Events/TokensAddedToCollectionFeedEvent';
import UserFollowedUsersFeedEvent from './Events/UserFollowedUsersFeedEvent';
import { FeedMode } from './Feed';
import FeedEventErrorBoundary from './FeedEventErrorBoundary';

type FeedEventProps = {
  eventRef: FeedEventFragment$key;
  queryRef: FeedEventQueryFragment$key;
  feedMode: FeedMode;
};

function FeedEvent({ eventRef, queryRef, feedMode }: FeedEventProps) {
  const event = useFragment(
    graphql`
      fragment FeedEventFragment on FeedEvent {
        caption
        eventData {
          __typename

          action
          eventTime

          ... on CollectionCreatedFeedEventData {
            ...CollectionCreatedFeedEventFragment
          }
          ... on CollectorsNoteAddedToTokenFeedEventData {
            ...CollectorsNoteAddedToTokenFeedEventFragment
          }
          ... on TokensAddedToCollectionFeedEventData {
            ...TokensAddedToCollectionFeedEventFragment
          }
          ... on UserFollowedUsersFeedEventData {
            ...UserFollowedUsersFeedEventFragment
          }
          ... on CollectorsNoteAddedToCollectionFeedEventData {
            ...CollectorsNoteAddedToCollectionFeedEventFragment
          }
          ... on CollectorsNoteAddedToCollectionFeedEventData {
            ...CollectorsNoteAddedToCollectionFeedEventFragment
          }
          ... on CollectionUpdatedFeedEventData {
            ...CollectionUpdatedFeedEventFragment
          }
        }
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment FeedEventQueryFragment on Query {
        ...UserFollowedUsersFeedEventQueryFragment
        ...TokensAddedToCollectionFeedEventQueryFragment
        ...CollectorsNoteAddedToCollectionFeedEventQueryFragment
        ...CollectionCreatedFeedEventQueryFragment
        ...CollectorsNoteAddedToTokenFeedEventQueryFragment
        ...CollectionUpdatedFeedEventQueryFragment
      }
    `,
    queryRef
  );

  switch (event.eventData?.__typename) {
    case 'CollectionCreatedFeedEventData':
      return (
        <CollectionCreatedFeedEvent
          caption={unescape(event.caption ?? '')}
          eventDataRef={event.eventData}
          queryRef={query}
        />
      );
    case 'CollectionUpdatedFeedEventData':
      return <CollectionUpdatedFeedEvent eventDataRef={event.eventData} queryRef={query} />;
    case 'CollectorsNoteAddedToTokenFeedEventData':
      return (
        <CollectorsNoteAddedToTokenFeedEvent eventDataRef={event.eventData} queryRef={query} />
      );
    case 'TokensAddedToCollectionFeedEventData':
      return (
        <TokensAddedToCollectionFeedEvent
          caption={unescape(event.caption ?? '')}
          eventDataRef={event.eventData}
          queryRef={query}
        />
      );
    case 'CollectorsNoteAddedToCollectionFeedEventData':
      return (
        <CollectorsNoteAddedToCollectionFeedEvent eventDataRef={event.eventData} queryRef={query} />
      );
    case 'UserFollowedUsersFeedEventData':
      return (
        <UserFollowedUsersFeedEvent
          eventDataRef={event.eventData}
          queryRef={query}
          feedMode={feedMode}
        />
      );

    // These event types are returned by the backend but are not currently spec'd to be displayed
    // case 'UserCreatedFeedEventData':

    default:
      throw new Error('Tried to render unsupported feed event');
  }
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

        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

  const isAdmireCommentEnabled = isFeatureEnabled(FeatureFlag.WHITE_RHINO, query);
  const eventSupportsAdmireComment =
    event.eventData?.__typename !== 'UserFollowedUsersFeedEventData';

  const shouldShowAdmireComment = isAdmireCommentEnabled && eventSupportsAdmireComment;

  const handlePotentialLayoutShift = useCallback(() => {
    onPotentialLayoutShift(index);
  }, [index, onPotentialLayoutShift]);

  return (
    <FeedEventErrorBoundary>
      <FeedEventContainer gap={16}>
        <FeedEvent eventRef={event} queryRef={query} feedMode={feedMode} />

        {shouldShowAdmireComment && (
          <ErrorBoundary fallback={<></>}>
            <FeedEventSocializeSection
              eventRef={event}
              queryRef={query}
              onPotentialLayoutShift={handlePotentialLayoutShift}
            />
          </ErrorBoundary>
        )}
      </FeedEventContainer>
    </FeedEventErrorBoundary>
  );
}

const FeedEventContainer = styled(VStack)`
  margin: 0 auto;

  border-bottom: 1px solid ${colors.faint};

  padding: 24px 16px;

  cursor: pointer;

  @media only screen and ${breakpoints.desktop} {
    max-width: initial;
    width: ${FEED_EVENT_ROW_WIDTH_DESKTOP}px;
  }
`;
