import colors from 'components/core/colors';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, BaseS } from 'components/core/Text/Text';
import unescape from 'utils/unescape';
import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { removeNullValues } from 'utils/removeNullValues';
import { pluralize } from 'utils/string';
import { getTimeSince } from 'utils/time';
import { CollectionCreatedFeedEventFragment$key } from '__generated__/CollectionCreatedFeedEventFragment.graphql';
import FeedEventTokenPreviews, { TokenToPreview } from '../FeedEventTokenPreviews';
import { StyledClickHandler, StyledEvent, StyledEventHeader, StyledTime } from './EventStyles';

type Props = {
  eventRef: CollectionCreatedFeedEventFragment$key;
};

const MAX_PIECES_DISPLAYED = 4;

export default function CollectionCreatedFeedEvent({ eventRef }: Props) {
  const event = useFragment(
    graphql`
      fragment CollectionCreatedFeedEventFragment on CollectionCreatedFeedEventData {
        eventTime
        owner @required(action: THROW) {
          username
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
      }
    `,
    eventRef
  );
  const { push } = useRouter();

  const tokensToPreview = useMemo(() => {
    return removeNullValues(event.collection.tokens).slice(0, MAX_PIECES_DISPLAYED);
  }, [event.collection.tokens]) as TokenToPreview[];

  const collectionPagePath = `/${event.owner.username}/${event.collection.dbid}`;
  const handleEventClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault();
      void push(collectionPagePath);
    },
    [collectionPagePath, push]
  );

  const numAdditionalPieces = event.collection.tokens.length - MAX_PIECES_DISPLAYED;
  const showAdditionalPiecesIndicator = numAdditionalPieces > 0;

  const collectionName = unescape(event.collection.name ?? '');

  return (
    <StyledEvent>
      <StyledClickHandler href={collectionPagePath} onClick={handleEventClick}>
        <StyledEventHeader>
          <InteractiveLink to={`/${event.owner.username}`}>{event.owner.username}</InteractiveLink>{' '}
          <BaseM>
            added {event.collection.tokens.length}{' '}
            {pluralize(event.collection.tokens.length, 'piece')} to their new collection
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
      </StyledClickHandler>
    </StyledEvent>
  );
}

const StyledAdditionalPieces = styled(BaseS)`
  width: fit-content;
  align-self: end;
  color: ${colors.metal};
`;
