import Link from 'next/link';
import { Route } from 'nextjs-routes';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import { UnstyledLink } from '~/components/core/Link/UnstyledLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, BaseS } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import { TokensAddedToCollectionFeedEventFragment$key } from '~/generated/TokensAddedToCollectionFeedEventFragment.graphql';
import { TokensAddedToCollectionFeedEventQueryFragment$key } from '~/generated/TokensAddedToCollectionFeedEventQueryFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { pluralize } from '~/utils/string';
import { getTimeSince } from '~/utils/time';
import unescape from '~/utils/unescape';

import { MAX_PIECES_DISPLAYED_PER_FEED_EVENT } from '../constants';
import FeedEventTokenPreviews from '../FeedEventTokenPreviews';
import { StyledCaptionContainer } from './CollectionCreatedFeedEvent';
import {
  StyledEventContent,
  StyledEventHeader,
  StyledEventLabel,
  StyledEventText,
  StyledTime,
} from './EventStyles';

type Props = {
  caption: string | null;
  isSubEvent?: boolean;
  eventDataRef: TokensAddedToCollectionFeedEventFragment$key;
  queryRef: TokensAddedToCollectionFeedEventQueryFragment$key;
};

export default function TokensAddedToCollectionFeedEvent({
  caption,
  eventDataRef,
  isSubEvent = false,
  queryRef,
}: Props) {
  const event = useFragment(
    graphql`
      fragment TokensAddedToCollectionFeedEventFragment on TokensAddedToCollectionFeedEventData {
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
        newTokens @required(action: THROW) {
          ...FeedEventTokenPreviewsFragment
        }
        isPreFeed
      }
    `,
    eventDataRef
  );

  const query = useFragment(
    graphql`
      fragment TokensAddedToCollectionFeedEventQueryFragment on Query {
        ...HoverCardOnUsernameFollowFragment
      }
    `,
    queryRef
  );

  const { isPreFeed } = event;

  const tokens = useMemo(
    () => (isPreFeed ? event.collection.tokens : event.newTokens ?? []),
    [event.collection.tokens, event.newTokens, isPreFeed]
  );

  const tokensToPreview = useMemo(() => {
    return removeNullValues(tokens).slice(0, MAX_PIECES_DISPLAYED_PER_FEED_EVENT);
  }, [tokens]);

  const collectionPagePath: Route = {
    pathname: '/[username]/[collectionId]',
    query: { username: event.owner.username as string, collectionId: event.collection.dbid },
  };
  const track = useTrack();

  const numAdditionalPieces = tokens.length - MAX_PIECES_DISPLAYED_PER_FEED_EVENT;
  const showAdditionalPiecesIndicator = numAdditionalPieces > 0;

  const collectionName = unescape(event.collection.name ?? '');

  if (!tokens.length) {
    throw new Error('Tried to render TokensAddedToCollectionFeedEvent without any tokens');
  }

  return (
    <UnstyledLink
      href={collectionPagePath}
      onClick={() => track('Feed: Clicked Tokens added to collection event')}
    >
      <VStack gap={16}>
        <StyledEventHeader>
          <VStack gap={4}>
            <HStack gap={4} inline>
              <StyledEventText isSubEvent={isSubEvent}>
                {!isSubEvent && <HoverCardOnUsername userRef={event.owner} queryRef={query} />}{' '}
                added {isPreFeed ? '' : `${tokens.length} ${pluralize(tokens.length, 'piece')}`} to
                {collectionName ? ' ' : ' their collection'}
                <Link href={collectionPagePath} passHref legacyBehavior>
                  <StyledEventLabel>{collectionName}</StyledEventLabel>
                </Link>
              </StyledEventText>
              {!isSubEvent && <StyledTime>{getTimeSince(event.eventTime)}</StyledTime>}
            </HStack>
          </VStack>
        </StyledEventHeader>
        <StyledEventContent gap={8} hasCaption={Boolean(caption)}>
          {caption && (
            <StyledCaptionContainer gap={8} align="center">
              <BaseM>{caption}</BaseM>
            </StyledCaptionContainer>
          )}
          <FeedEventTokenPreviews
            isInCaption={Boolean(caption)}
            tokenToPreviewRefs={tokensToPreview}
          />
          {showAdditionalPiecesIndicator && !isPreFeed && (
            <StyledAdditionalPieces>
              +{numAdditionalPieces} more {pluralize(numAdditionalPieces, 'piece')}
            </StyledAdditionalPieces>
          )}
        </StyledEventContent>
      </VStack>
    </UnstyledLink>
  );
}

const StyledAdditionalPieces = styled(BaseS)`
  text-align: end;
  color: ${colors.metal};
`;
