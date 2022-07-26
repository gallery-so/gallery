import colors from 'components/core/colors';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, BaseS } from 'components/core/Text/Text';
import unescape from 'utils/unescape';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { removeNullValues } from 'utils/removeNullValues';
import { pluralize } from 'utils/string';
import { getTimeSince } from 'utils/time';
import { CollectionCreatedFeedEventFragment$key } from '__generated__/CollectionCreatedFeedEventFragment.graphql';
import { CollectionCreatedFeedEventQueryFragment$key } from '__generated__/CollectionCreatedFeedEventQueryFragment.graphql';
import FeedEventTokenPreviews, { TokenToPreview } from '../FeedEventTokenPreviews';
import { StyledEvent, StyledEventHeader, StyledTime } from './EventStyles';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { UnstyledLink } from 'components/core/Link/UnstyledLink';
import HoverCardOnUsername from 'components/HoverCard/HoverCardOnUsername';

type Props = {
  eventRef: CollectionCreatedFeedEventFragment$key;
  queryRef: CollectionCreatedFeedEventQueryFragment$key;
};

const MAX_PIECES_DISPLAYED = 4;

export default function CollectionCreatedFeedEvent({ eventRef, queryRef }: Props) {
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
    eventRef
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

  const collectionPagePath = `/${event.owner?.username}/${event.collection.dbid}`;
  const track = useTrack();

  const numAdditionalPieces = tokens.length - MAX_PIECES_DISPLAYED;
  const showAdditionalPiecesIndicator = numAdditionalPieces > 0;

  const collectionName = unescape(event.collection.name ?? '');

  if (!tokens.length || !event.owner) {
    return null;
  }

  return (
    <UnstyledLink
      href={collectionPagePath}
      onClick={() => track('Feed: Clicked collection created event')}
    >
      <StyledEvent>
        <StyledEventHeader>
          <HoverCardOnUsername
            username={event?.owner.username || ''}
            userRef={event.owner}
            queryRef={query}
          />{' '}
          <BaseM>
            added {tokens.length} {pluralize(tokens.length, 'piece')} to their new collection
            {collectionName && `, `}
          </BaseM>
          {collectionName && (
            <InteractiveLink to={`/${event.owner.username}/${event.collection.dbid}`}>
              {unescape(event.collection.name ?? '')}
            </InteractiveLink>
          )}
          <Spacer width={4} />
          <StyledTime>{getTimeSince(event.eventTime)}</StyledTime>
        </StyledEventHeader>
        <Spacer height={16} />
        <FeedEventTokenPreviews tokensToPreview={tokensToPreview} />
        {showAdditionalPiecesIndicator && (
          <>
            <Spacer height={8} />
            <StyledAdditionalPieces>
              +{numAdditionalPieces} more {pluralize(numAdditionalPieces, 'piece')}
            </StyledAdditionalPieces>
          </>
        )}
      </StyledEvent>
    </UnstyledLink>
  );
}

const StyledAdditionalPieces = styled(BaseS)`
  text-align: end;
  color: ${colors.metal};
`;
