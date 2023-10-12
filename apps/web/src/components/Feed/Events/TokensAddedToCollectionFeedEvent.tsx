import { Route } from 'nextjs-routes';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { UnstyledLink } from '~/components/core/Link/UnstyledLink';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, BaseS } from '~/components/core/Text/Text';
import UserHoverCard from '~/components/HoverCard/UserHoverCard';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { TokensAddedToCollectionFeedEventFragment$key } from '~/generated/TokensAddedToCollectionFeedEventFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import colors from '~/shared/theme/colors';
import { getTimeSince } from '~/shared/utils/time';
import unescape from '~/shared/utils/unescape';
import { pluralize } from '~/utils/string';

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
};

export default function TokensAddedToCollectionFeedEvent({
  caption,
  eventDataRef,
  isSubEvent = false,
}: Props) {
  const event = useFragment(
    graphql`
      fragment TokensAddedToCollectionFeedEventFragment on TokensAddedToCollectionFeedEventData {
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
        }
        newTokens @required(action: THROW) {
          ...FeedEventTokenPreviewsFragment
        }
        isPreFeed
      }
    `,
    eventDataRef
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
                {!isSubEvent && (
                  <HStack align="center" gap={4} inline>
                    <ProfilePicture userRef={event.owner} size="sm" />
                    <UserHoverCard userRef={event.owner} />
                  </HStack>
                )}
                <BaseM>
                  added {isPreFeed ? '' : `${tokens.length} ${pluralize(tokens.length, 'piece')}`}{' '}
                  to
                  {collectionName ? ' ' : ' their collection'}
                </BaseM>
                <StyledEventLabel>{collectionName}</StyledEventLabel>
              </StyledEventText>
              {!isSubEvent && <StyledTime>{getTimeSince(event.eventTime)}</StyledTime>}
            </HStack>
          </VStack>
        </StyledEventHeader>
        <StyledEventContent gap={8} hasCaption={Boolean(caption)}>
          {caption && (
            <StyledCaptionContainer gap={8} align="center">
              <BaseM>
                <Markdown text={caption} eventContext={contexts.Feed} />
              </BaseM>
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
