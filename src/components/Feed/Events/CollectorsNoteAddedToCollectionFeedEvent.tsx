import { Route } from 'nextjs-routes';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import colors from '~/components/core/colors';
import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import { UnstyledLink } from '~/components/core/Link/UnstyledLink';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import { CollectorsNoteAddedToCollectionFeedEventFragment$key } from '~/generated/CollectorsNoteAddedToCollectionFeedEventFragment.graphql';
import { CollectorsNoteAddedToCollectionFeedEventQueryFragment$key } from '~/generated/CollectorsNoteAddedToCollectionFeedEventQueryFragment.graphql';
import { removeNullValues } from '~/utils/removeNullValues';
import { getTimeSince } from '~/utils/time';
import unescape from '~/utils/unescape';

import FeedEventTokenPreviews from '../FeedEventTokenPreviews';
import { StyledEvent, StyledEventContent, StyledEventHeader, StyledTime } from './EventStyles';

type Props = {
  eventDataRef: CollectorsNoteAddedToCollectionFeedEventFragment$key;
  queryRef: CollectorsNoteAddedToCollectionFeedEventQueryFragment$key;
  isSubEvent?: boolean;
};

export default function CollectorsNoteAddedToCollectionFeedEvent({
  eventDataRef,
  isSubEvent = false,
  queryRef,
}: Props) {
  const event = useFragment(
    graphql`
      fragment CollectorsNoteAddedToCollectionFeedEventFragment on CollectorsNoteAddedToCollectionFeedEventData {
        eventTime
        owner @required(action: THROW) {
          username
          ...HoverCardOnUsernameFragment
        }
        collection @required(action: THROW) {
          dbid
          name
          tokens(limit: $visibleTokensPerFeedEvent) @required(action: THROW) {
            ...FeedEventTokenPreviewsFragment
          }
        }
        newCollectorsNote
      }
    `,
    eventDataRef
  );

  const query = useFragment(
    graphql`
      fragment CollectorsNoteAddedToCollectionFeedEventQueryFragment on Query {
        ...HoverCardOnUsernameFollowFragment
      }
    `,
    queryRef
  );

  const collectionPagePath: Route = {
    pathname: '/[username]/[collectionId]',
    query: { username: event.owner.username as string, collectionId: event.collection.dbid },
  };

  const track = useTrack();

  const nonNullTokens = useMemo(() => {
    return removeNullValues(event.collection.tokens);
  }, [event.collection.tokens]);

  // [GAL-608] Bring this back once we fix perf around tokenURI
  // const numAdditionalPieces = event.collection.tokens.length - MAX_PIECES_DISPLAYED_PER_FEED_EVENT;
  // const showAdditionalPiecesIndicator = numAdditionalPieces > 0;

  const collectionName = unescape(event.collection.name ?? '');

  if (!event.collection.tokens.length) {
    throw new Error('Tried to render CollectorsNoteAddedToCollectionFeedEvent without any tokens');
  }

  return (
    <UnstyledLink
      href={collectionPagePath}
      onClick={() => track('Feed: Clicked Description added to collection event')}
    >
      <StyledEvent isSubEvent={isSubEvent}>
        <VStack gap={isSubEvent ? 0 : 16}>
          <VStack gap={8}>
            <StyledEventHeader>
              <HStack gap={4} inline>
                {isSubEvent ? (
                  <BaseM>
                    Added a description to
                    {collectionName ? ' ' : ' their collection'}
                    <InteractiveLink to={collectionPagePath}>{collectionName}</InteractiveLink>
                  </BaseM>
                ) : (
                  <BaseM>
                    <HoverCardOnUsername userRef={event.owner} queryRef={query} /> added a
                    description to
                    {collectionName ? ' ' : ' their collection'}
                    <InteractiveLink to={collectionPagePath}>{collectionName}</InteractiveLink>
                  </BaseM>
                )}
                <StyledTime>{getTimeSince(event.eventTime)}</StyledTime>
              </HStack>
            </StyledEventHeader>
          </VStack>

          <StyledEventContent gap={16} hasCaption={Boolean(event.newCollectorsNote)}>
            <StyledQuote>
              <Markdown text={unescape(event.newCollectorsNote ?? '')} inheritLinkStyling />
            </StyledQuote>
            <FeedEventTokenPreviews
              isInCaption={Boolean(event.newCollectorsNote)}
              tokenToPreviewRefs={nonNullTokens}
            />
          </StyledEventContent>
          {/* [GAL-608] Bring this back once we fix perf around tokenURI
          {showAdditionalPiecesIndicator && (
            <StyledAdditionalPieces>
              +{numAdditionalPieces} more {pluralize(numAdditionalPieces, 'piece')}
            </StyledAdditionalPieces>
          )} */}
        </VStack>
      </StyledEvent>
    </UnstyledLink>
  );
}

// [GAL-608] Bring this back once we fix perf around tokenURI
// const StyledAdditionalPieces = styled(BaseS)`
//   text-align: end;
//   color: ${colors.metal};
//   padding-top: 8px;
// `;

const StyledQuote = styled(BaseM)`
  border-left: 2px solid ${colors.porcelain};
  padding-left: 8px;

  @media only screen and ${breakpoints.tablet} {
    max-width: 50%;
  }
`;
