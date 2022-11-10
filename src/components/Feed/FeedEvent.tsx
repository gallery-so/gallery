import { ErrorBoundary } from '@sentry/nextjs';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';

import { VStack } from '~/components/core/Spacer/Stack';
import { FeedEventSocializeSection } from '~/components/Feed/Socialize/FeedEventSocializeSection';
import { FeedEventFragment$key } from '~/generated/FeedEventFragment.graphql';
import { FeedEventQueryFragment$key } from '~/generated/FeedEventQueryFragment.graphql';
import { FeedEventWithErrorBoundaryFragment$key } from '~/generated/FeedEventWithErrorBoundaryFragment.graphql';
import { FeedEventWithErrorBoundaryQueryFragment$key } from '~/generated/FeedEventWithErrorBoundaryQueryFragment.graphql';
import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';

import CollectionCreatedFeedEvent from './Events/CollectionCreatedFeedEvent';
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
      }
    `,
    queryRef
  );

  switch (event.eventData?.__typename) {
    case 'CollectionCreatedFeedEventData':
      return <CollectionCreatedFeedEvent eventDataRef={event.eventData} queryRef={query} />;
    case 'CollectorsNoteAddedToTokenFeedEventData':
      return (
        <CollectorsNoteAddedToTokenFeedEvent eventDataRef={event.eventData} queryRef={query} />
      );
    case 'TokensAddedToCollectionFeedEventData':
      return <TokensAddedToCollectionFeedEvent eventDataRef={event.eventData} queryRef={query} />;
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
      <VStack gap={16}>
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
      </VStack>
    </FeedEventErrorBoundary>
  );
}
