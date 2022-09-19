import colors from 'components/core/colors';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import { BaseM, BaseS } from 'components/core/Text/Text';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';
import { removeNullValues } from 'utils/removeNullValues';
import { pluralize } from 'utils/string';
import { getTimeSince } from 'utils/time';
import { TokensAddedToCollectionFeedEventFragment$key } from '__generated__/TokensAddedToCollectionFeedEventFragment.graphql';
import FeedEventTokenPreviews, { TokenToPreview } from '../FeedEventTokenPreviews';
import { StyledEvent, StyledEventHeader, StyledTime } from './EventStyles';
import unescape from 'utils/unescape';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { UnstyledLink } from 'components/core/Link/UnstyledLink';
import HoverCardOnUsername from 'components/HoverCard/HoverCardOnUsername';
import { TokensAddedToCollectionFeedEventQueryFragment$key } from '__generated__/TokensAddedToCollectionFeedEventQueryFragment.graphql';
import { HStack, VStack } from 'components/core/Spacer/Stack';

type Props = {
  eventRef: TokensAddedToCollectionFeedEventFragment$key;
  queryRef: TokensAddedToCollectionFeedEventQueryFragment$key;
};

const MAX_PIECES_DISPLAYED = 4;

export default function TokensAddedToCollectionFeedEvent({ eventRef, queryRef }: Props) {
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
          tokens @required(action: THROW) {
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
    eventRef
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
    return removeNullValues(tokens).slice(0, MAX_PIECES_DISPLAYED);
  }, [tokens]) as TokenToPreview[];

  const collectionPagePath = `/${event.owner.username}/${event.collection.dbid}`;
  const track = useTrack();

  const numAdditionalPieces = tokens.length - MAX_PIECES_DISPLAYED;
  const showAdditionalPiecesIndicator = numAdditionalPieces > 0;

  const collectionName = unescape(event.collection.name ?? '');

  if (!tokens.length) {
    return null;
  }

  return (
    <UnstyledLink
      href={collectionPagePath}
      onClick={() => track('Feed: Clicked Tokens added to collection event')}
    >
      <StyledEvent>
        <VStack gap={16}>
          <StyledEventHeader>
            <HStack gap={4} inline>
              <BaseM>
                <HoverCardOnUsername userRef={event.owner} queryRef={query} /> added{' '}
                {isPreFeed ? '' : `${tokens.length} ${pluralize(tokens.length, 'piece')}`} to
                {collectionName ? ' ' : ' their collection'}
                <InteractiveLink to={collectionPagePath}>{collectionName}</InteractiveLink>
              </BaseM>
              <StyledTime>{getTimeSince(event.eventTime)}</StyledTime>
            </HStack>
          </StyledEventHeader>
          <VStack gap={8}>
            <FeedEventTokenPreviews tokensToPreview={tokensToPreview} />
            {showAdditionalPiecesIndicator && !isPreFeed && (
              <StyledAdditionalPieces>
                +{numAdditionalPieces} more {pluralize(numAdditionalPieces, 'piece')}
              </StyledAdditionalPieces>
            )}
          </VStack>
        </VStack>
      </StyledEvent>
    </UnstyledLink>
  );
}

const StyledAdditionalPieces = styled(BaseS)`
  text-align: end;
  color: ${colors.metal};
`;
