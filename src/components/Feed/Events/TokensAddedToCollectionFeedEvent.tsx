import { Route } from 'nextjs-routes';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import { UnstyledLink } from '~/components/core/Link/UnstyledLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, BaseS } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import { TokensAddedToCollectionFeedEventFragment$key } from '~/generated/TokensAddedToCollectionFeedEventFragment.graphql';
import { TokensAddedToCollectionFeedEventQueryFragment$key } from '~/generated/TokensAddedToCollectionFeedEventQueryFragment.graphql';
import { removeNullValues } from '~/utils/removeNullValues';
import { pluralize } from '~/utils/string';
import { getTimeSince } from '~/utils/time';
import unescape from '~/utils/unescape';

import { MAX_PIECES_DISPLAYED_PER_FEED_EVENT } from '../constants';
import FeedEventTokenPreviews, { TokenToPreview } from '../FeedEventTokenPreviews';
import { StyledCaptionContainer } from './CollectionCreatedFeedEvent';
import { StyledEvent, StyledEventContent, StyledEventHeader, StyledTime } from './EventStyles';

type Props = {
  caption: string | null;
  eventDataRef: TokensAddedToCollectionFeedEventFragment$key;
  queryRef: TokensAddedToCollectionFeedEventQueryFragment$key;
};

export default function TokensAddedToCollectionFeedEvent({
  caption,
  eventDataRef,
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
            token {
              dbid
            }
            ...EventMediaFragment
          }
        }
        newTokens @required(action: THROW) {
          token {
            dbid
          }
          ...EventMediaFragment
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

  const tokens = isPreFeed ? event.collection.tokens : event.newTokens;

  const tokensToPreview = useMemo(() => {
    return removeNullValues(tokens).slice(0, MAX_PIECES_DISPLAYED_PER_FEED_EVENT);
  }, [tokens]) as TokenToPreview[];

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
      <StyledEvent>
        <VStack gap={16}>
          <StyledEventHeader>
            <VStack gap={4}>
              <HStack gap={4} inline>
                <BaseM>
                  <HoverCardOnUsername userRef={event.owner} queryRef={query} /> added{' '}
                  {isPreFeed ? '' : `${tokens.length} ${pluralize(tokens.length, 'piece')}`} to
                  {collectionName ? ' ' : ' their collection'}
                  <InteractiveLink to={collectionPagePath}>{collectionName}</InteractiveLink>
                </BaseM>
                <StyledTime>{getTimeSince(event.eventTime)}</StyledTime>
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
              tokensToPreview={tokensToPreview}
            />
            {showAdditionalPiecesIndicator && !isPreFeed && (
              <StyledAdditionalPieces>
                +{numAdditionalPieces} more {pluralize(numAdditionalPieces, 'piece')}
              </StyledAdditionalPieces>
            )}
          </StyledEventContent>
        </VStack>
      </StyledEvent>
    </UnstyledLink>
  );
}

const StyledAdditionalPieces = styled(BaseS)`
  text-align: end;
  color: ${colors.metal};
`;
