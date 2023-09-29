import Link from 'next/link';
import { Route } from 'nextjs-routes';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { UnstyledLink } from '~/components/core/Link/UnstyledLink';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import UserHoverCard from '~/components/HoverCard/UserHoverCard';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { CollectorsNoteAddedToCollectionFeedEventFragment$key } from '~/generated/CollectorsNoteAddedToCollectionFeedEventFragment.graphql';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import colors from '~/shared/theme/colors';
import { getTimeSince } from '~/shared/utils/time';
import unescape from '~/shared/utils/unescape';

import FeedEventTokenPreviews from '../FeedEventTokenPreviews';
import {
  StyledEvent,
  StyledEventContent,
  StyledEventHeader,
  StyledEventLabel,
  StyledEventText,
  StyledTime,
} from './EventStyles';

type Props = {
  eventDataRef: CollectorsNoteAddedToCollectionFeedEventFragment$key;
  isSubEvent?: boolean;
};

export default function CollectorsNoteAddedToCollectionFeedEvent({
  eventDataRef,
  isSubEvent = false,
}: Props) {
  const event = useFragment(
    graphql`
      fragment CollectorsNoteAddedToCollectionFeedEventFragment on CollectorsNoteAddedToCollectionFeedEventData {
        eventTime
        owner @required(action: THROW) {
          username
          ...UserHoverCardFragment
          ...ProfilePictureFragment
        }
        collection @required(action: THROW) {
          dbid
          name
          tokens(limit: $visibleTokensPerFeedEvent) @required(action: THROW) {
            ...FeedEventTokenPreviewsFragment
          }
          gallery {
            dbid
          }
        }
        newCollectorsNote
      }
    `,
    eventDataRef
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

  if (!event.collection.gallery?.dbid) {
    throw new Error('Tried to render CollectorsNoteAddedToCollectionFeedEvent without a gallery');
  }

  return (
    <UnstyledLink
      href={collectionPagePath}
      onClick={() => track('Feed: Clicked Description added to collection event')}
    >
      <StyledEvent>
        <VStack gap={isSubEvent ? 0 : 16}>
          <StyledEventHeader>
            <StyledEventText isSubEvent={isSubEvent}>
              {!isSubEvent && (
                <HStack gap={4} align="center">
                  <ProfilePicture userRef={event.owner} size="sm" />
                  <UserHoverCard userRef={event.owner} />
                </HStack>
              )}
              <BaseM>added a description to {collectionName ? ' ' : ' their collection'}</BaseM>
              <Link href={collectionPagePath} passHref legacyBehavior>
                <StyledEventLabel>{collectionName}</StyledEventLabel>
              </Link>
              {!isSubEvent && <StyledTime>{getTimeSince(event.eventTime)}</StyledTime>}
            </StyledEventText>
          </StyledEventHeader>

          <StyledEventContent
            gap={16}
            hasCaption={Boolean(event.newCollectorsNote)}
            isSubEvent={isSubEvent}
          >
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

  p {
    padding-bottom: 0;
  }

  @media only screen and ${breakpoints.tablet} {
    max-width: 50%;
  }
`;
