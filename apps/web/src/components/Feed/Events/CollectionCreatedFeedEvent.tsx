import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { UnstyledLink } from '~/components/core/Link/UnstyledLink';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, BaseS } from '~/components/core/Text/Text';
import UserHoverCard from '~/components/HoverCard/UserHoverCard';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { CollectionCreatedFeedEventFragment$key } from '~/generated/CollectionCreatedFeedEventFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import colors from '~/shared/theme/colors';
import { getTimeSince } from '~/shared/utils/time';
import unescape from '~/shared/utils/unescape';
import { pluralize } from '~/utils/string';

import { MAX_PIECES_DISPLAYED_PER_FEED_EVENT } from '../constants';
import FeedEventTokenPreviews from '../FeedEventTokenPreviews';
import {
  StyledEventContent,
  StyledEventHeader,
  StyledEventLabel,
  StyledEventText,
  StyledTime,
} from './EventStyles';

type Props = {
  isSubEvent?: boolean;
  eventDataRef: CollectionCreatedFeedEventFragment$key;
};

export default function CollectionCreatedFeedEvent({ eventDataRef, isSubEvent }: Props) {
  const event = useFragment(
    graphql`
      fragment CollectionCreatedFeedEventFragment on CollectionCreatedFeedEventData {
        eventTime
        owner {
          username
          ...UserHoverCardFragment
          ...ProfilePictureFragment
        }
        collection @required(action: THROW) {
          dbid
          name
        }
        newTokens @required(action: THROW) {
          ...FeedEventTokenPreviewsFragment
        }
        newCollectorsNote
      }
    `,
    eventDataRef
  );

  const tokens = useMemo(() => event?.newTokens ?? [], [event?.newTokens]);

  const tokensToPreview = useMemo(() => {
    return removeNullValues(tokens).slice(0, MAX_PIECES_DISPLAYED_PER_FEED_EVENT);
  }, [tokens]);

  const track = useTrack();

  const numAdditionalPieces = tokens.length - MAX_PIECES_DISPLAYED_PER_FEED_EVENT;
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
      <VStack gap={event.newCollectorsNote ? 0 : 16}>
        <StyledEventHeader>
          <VStack gap={4}>
            <StyledEventHeaderContainer>
              <StyledEventText isSubEvent={isSubEvent}>
                {!isSubEvent && (
                  <HStack gap={4} align="center" inline>
                    <ProfilePicture userRef={event.owner} size="sm" />
                    <UserHoverCard userRef={event.owner} />
                  </HStack>
                )}{' '}
                <BaseM>
                  added {tokens.length} {pluralize(tokens.length, 'piece')} to their new collection
                  {collectionName ? `, ` : ' '}
                </BaseM>
                {collectionName && (
                  <StyledEventLabel>{unescape(event.collection.name ?? '')}</StyledEventLabel>
                )}
                {!isSubEvent && <StyledTime>{getTimeSince(event.eventTime)}</StyledTime>}
              </StyledEventText>
            </StyledEventHeaderContainer>
          </VStack>
        </StyledEventHeader>
        <StyledEventContent
          gap={16}
          hasCaption={Boolean(event.newCollectorsNote)}
          isSubEvent={isSubEvent}
        >
          {event.newCollectorsNote && (
            <StyledCaptionContainer gap={8} align="center">
              <BaseM>
                <Markdown text={event.newCollectorsNote} eventContext={contexts.Feed} />
              </BaseM>
            </StyledCaptionContainer>
          )}
          <VStack gap={8}>
            <FeedEventTokenPreviews
              isInCaption={Boolean(event.newCollectorsNote || isSubEvent)}
              tokenToPreviewRefs={tokensToPreview}
            />
            {showAdditionalPiecesIndicator && (
              <StyledAdditionalPieces>
                +{numAdditionalPieces} more {pluralize(numAdditionalPieces, 'piece')}
              </StyledAdditionalPieces>
            )}
          </VStack>
        </StyledEventContent>
      </VStack>
    </UnstyledLink>
  );
}

const StyledEventHeaderContainer = styled.div`
  display: inline;
`;

const StyledAdditionalPieces = styled(BaseS)`
  text-align: end;
  color: ${colors.metal};
`;

export const StyledCaptionContainer = styled(HStack)`
  border-left: 2px solid #d9d9d9;
  padding-left: 8px;

  p {
    padding-bottom: 0;
  }

  ${BaseS} {
    color: ${colors.metal};
  }
`;
