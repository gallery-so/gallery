import { graphql, useFragment } from 'react-relay';
import { FeedEventFragment$key } from '__generated__/FeedEventFragment.graphql';
import { FeedEventQueryFragment$key } from '__generated__/FeedEventQueryFragment.graphql';
import CollectionCreatedFeedEvent from './Events/CollectionCreatedFeedEvent';
import CollectorsNoteAddedToCollectionFeedEvent from './Events/CollectorsNoteAddedToCollectionFeedEvent';
import CollectorsNoteAddedToTokenFeedEvent from './Events/CollectorsNoteAddedToTokenFeedEvent';
import TokensAddedToCollectionFeedEvent from './Events/TokensAddedToCollectionFeedEvent';
import UserFollowedUsersFeedEvent from './Events/UserFollowedUsersFeedEvent';
import { FeedMode } from './Feed';
import FeedEventErrorBoundary from './FeedEventErrorBoundary';
import { FeedEventSocializeSection } from 'components/Feed/Socialize/FeedEventSocializeSection';
import { ErrorBoundary } from '@sentry/nextjs';
import { FeedEventWithErrorBoundaryFragment$key } from '../../../__generated__/FeedEventWithErrorBoundaryFragment.graphql';
import { FeedEventWithErrorBoundaryQueryFragment$key } from '../../../__generated__/FeedEventWithErrorBoundaryQueryFragment.graphql';
import { VStack } from 'components/core/Spacer/Stack';
import styled from 'styled-components';
import { StyledInnerEvent } from './Events/EventStyles';
import {
  FEED_EVENT_ROW_WIDTH_DESKTOP,
  FEED_EVENT_ROW_WIDTH_TABLET,
} from 'components/Feed/dimensions';
import breakpoints from 'components/core/breakpoints';

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
  eventRef: FeedEventWithErrorBoundaryFragment$key;
  queryRef: FeedEventWithErrorBoundaryQueryFragment$key;
  feedMode: FeedMode;
};

export default function FeedEventWithBoundary({
  feedMode,
  eventRef,
  queryRef,
}: FeedEventWithBoundaryProps) {
  const event = useFragment(
    graphql`
      fragment FeedEventWithErrorBoundaryFragment on FeedEvent {
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
      }
    `,
    queryRef
  );

  return (
    <FeedEventErrorBoundary>
      <StyledVStack gap={16}>
        <FeedEvent eventRef={event} queryRef={query} feedMode={feedMode} />

        <ErrorBoundary fallback={<></>}>
          <SocializedSectionPadding>
            <SocializeSectionWrapper>
              <FeedEventSocializeSection eventRef={event} />
            </SocializeSectionWrapper>
          </SocializedSectionPadding>
        </ErrorBoundary>
      </StyledVStack>
    </FeedEventErrorBoundary>
  );
}

const SocializedSectionPadding = styled.div`
  padding: 0 16px;
`;

// Modeled after StyledEventInner
const SocializeSectionWrapper = styled.div`
  max-width: ${FEED_EVENT_ROW_WIDTH_TABLET}px;
  width: 100%;

  @media only screen and ${breakpoints.desktop} {
    max-width: initial;
    width: ${FEED_EVENT_ROW_WIDTH_DESKTOP}px;
  }

  // Center in space
  margin: 0 auto;
`;

const StyledVStack = styled(VStack)`
  padding-bottom: 16px;
`;
