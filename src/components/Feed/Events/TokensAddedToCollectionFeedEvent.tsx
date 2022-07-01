import colors from 'components/core/colors';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, BaseS } from 'components/core/Text/Text';
import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';
import { removeNullValues } from 'utils/removeNullValues';
import { pluralize } from 'utils/string';
import { getTimeSince } from 'utils/time';
import { TokensAddedToCollectionFeedEventFragment$key } from '__generated__/TokensAddedToCollectionFeedEventFragment.graphql';
import FeedEventTokenPreviews, { TokenToPreview } from '../FeedEventTokenPreviews';
import { StyledClickHandler, StyledEvent, StyledEventHeader, StyledTime } from './EventStyles';
import unescape from 'utils/unescape';
import { useTrack } from 'contexts/analytics/AnalyticsContext';

type Props = {
  eventRef: TokensAddedToCollectionFeedEventFragment$key;
};

const MAX_PIECES_DISPLAYED = 4;

export default function TokensAddedToCollectionFeedEvent({ eventRef }: Props) {
  const event = useFragment(
    graphql`
      fragment TokensAddedToCollectionFeedEventFragment on TokensAddedToCollectionFeedEventData {
        eventTime
        owner @required(action: THROW) {
          username
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
  const { push } = useRouter();

  const tokensToPreview = useMemo(() => {
    return removeNullValues(event.newTokens).slice(0, MAX_PIECES_DISPLAYED);
  }, [event.newTokens]) as TokenToPreview[];

  const collectionPagePath = `/${event.owner.username}/${event.collection.dbid}`;
  const track = useTrack();
  const handleEventClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault();
      track('Feed: Clicked Tokens added to collection event');
      void push(collectionPagePath);
    },
    [collectionPagePath, push, track]
  );

  const numAdditionalPieces = event.newTokens.length - MAX_PIECES_DISPLAYED;
  const showAdditionalPiecesIndicator = numAdditionalPieces > 0;

  const collectionName = unescape(event.collection.name ?? '');

  return (
    <StyledClickHandler href={collectionPagePath} onClick={handleEventClick}>
      <StyledEvent>
        <StyledEventHeader>
          <BaseM>
            <InteractiveLink to={`/${event.owner.username}`}>
              {event.owner.username}
            </InteractiveLink>{' '}
            added {event.newTokens.length} {pluralize(event.newTokens.length, 'piece')} to
            {collectionName ? ' ' : ' their collection'}
            <InteractiveLink to={collectionPagePath}>{collectionName}</InteractiveLink>
          </BaseM>
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
    </StyledClickHandler>
  );
}

const StyledAdditionalPieces = styled(BaseS)`
  text-align: end;
  color: ${colors.metal};
`;
