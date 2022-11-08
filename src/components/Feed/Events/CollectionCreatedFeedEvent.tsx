import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import { UnstyledLink } from '~/components/core/Link/UnstyledLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, BaseS } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import { CollectionCreatedFeedEventFragment$key } from '~/generated/CollectionCreatedFeedEventFragment.graphql';
import { CollectionCreatedFeedEventQueryFragment$key } from '~/generated/CollectionCreatedFeedEventQueryFragment.graphql';
import { removeNullValues } from '~/utils/removeNullValues';
import { pluralize } from '~/utils/string';
import { getTimeSince } from '~/utils/time';
import unescape from '~/utils/unescape';

import FeedEventTokenPreviews, { TokenToPreview } from '../FeedEventTokenPreviews';
import { StyledEvent, StyledEventHeader, StyledTime } from './EventStyles';

type Props = {
  caption: string | null;
  eventDataRef: CollectionCreatedFeedEventFragment$key;
  queryRef: CollectionCreatedFeedEventQueryFragment$key;
};

const MAX_PIECES_DISPLAYED = 4;

export default function CollectionCreatedFeedEvent({ caption, eventDataRef, queryRef }: Props) {
  const event = useFragment(
    graphql`
      fragment CollectionCreatedFeedEventFragment on CollectionCreatedFeedEventData {
        eventTime
        owner {
          username
          ...HoverCardOnUsernameFragment
        }
        collection @required(action: THROW) {
          dbid
          name
        }
        newTokens @required(action: THROW) {
          token {
            dbid
          }
          ...EventMediaFragment
        }
      }
    `,
    eventDataRef
  );

  const query = useFragment(
    graphql`
      fragment CollectionCreatedFeedEventQueryFragment on Query {
        ...HoverCardOnUsernameFollowFragment
      }
    `,
    queryRef
  );

  const tokens = event.newTokens;

  const tokensToPreview = useMemo(() => {
    return removeNullValues(tokens).slice(0, MAX_PIECES_DISPLAYED);
  }, [tokens]) as TokenToPreview[];

  const track = useTrack();

  const numAdditionalPieces = tokens.length - MAX_PIECES_DISPLAYED;
  const showAdditionalPiecesIndicator = numAdditionalPieces > 0;

  const collectionName = unescape(event.collection.name ?? '');

  if (!tokens.length || !event.owner) {
    throw new Error('Tried to render CollectionCreatedFeedEvent without an owner / tokens');
  }

  return (
    <UnstyledLink
      href={{
        pathname: '/[username]/[collectionId]',
        query: { username: event.owner.username as string, collectionId: event.collection.dbid },
      }}
      onClick={() => track('Feed: Clicked collection created event')}
    >
      <StyledEvent>
        <VStack gap={16}>
          <StyledEventHeader>
            <VStack gap={4}>
              <HStack inline gap={2} align="center">
                <HoverCardOnUsername userRef={event.owner} queryRef={query} />{' '}
                <BaseM>
                  added {tokens.length} {pluralize(tokens.length, 'piece')} to their new collection
                  {collectionName ? `, ` : ' '}
                </BaseM>
                <HStack gap={4} inline>
                  {collectionName && (
                    <InteractiveLink
                      to={{
                        pathname: '/[username]/[collectionId]',
                        query: {
                          username: event.owner.username as string,
                          collectionId: event.collection.dbid,
                        },
                      }}
                    >
                      {unescape(event.collection.name ?? '')}
                    </InteractiveLink>
                  )}
                  <StyledTime>{getTimeSince(event.eventTime)}</StyledTime>
                </HStack>
              </HStack>
              {caption && (
                <StyledCaptionContainer gap={8} align="center">
                  <BaseS>{caption}</BaseS>
                </StyledCaptionContainer>
              )}
            </VStack>
          </StyledEventHeader>
          <VStack gap={8}>
            <FeedEventTokenPreviews tokensToPreview={tokensToPreview} />
            {showAdditionalPiecesIndicator && (
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

export const StyledCaptionContainer = styled(HStack)`
  border-left: 2px solid #d9d9d9;
  padding-left: 8px;

  ${BaseS} {
    color: ${colors.metal};
  }
`;
