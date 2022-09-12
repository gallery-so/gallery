import colors from 'components/core/colors';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import DeprecatedSpacer from 'components/core/Spacer/DeprecatedSpacer';
import { BaseM, BaseS } from 'components/core/Text/Text';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';
import { removeNullValues } from 'utils/removeNullValues';
import { pluralize } from 'utils/string';
import { getTimeSince } from 'utils/time';
import { CollectorsNoteAddedToCollectionFeedEventFragment$key } from '__generated__/CollectorsNoteAddedToCollectionFeedEventFragment.graphql';
import FeedEventTokenPreviews, { TokenToPreview } from '../FeedEventTokenPreviews';
import { StyledEvent, StyledEventHeader, StyledTime } from './EventStyles';
import unescape from 'utils/unescape';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import breakpoints from 'components/core/breakpoints';
import { UnstyledLink } from 'components/core/Link/UnstyledLink';
import HoverCardOnUsername from 'components/HoverCard/HoverCardOnUsername';
import { CollectorsNoteAddedToCollectionFeedEventQueryFragment$key } from '__generated__/CollectorsNoteAddedToCollectionFeedEventQueryFragment.graphql';
import Markdown from 'components/core/Markdown/Markdown';

type Props = {
  eventDataRef: CollectorsNoteAddedToCollectionFeedEventFragment$key;
  queryRef: CollectorsNoteAddedToCollectionFeedEventQueryFragment$key;
};

const MAX_PIECES_DISPLAYED = 4;

export default function CollectorsNoteAddedToCollectionFeedEvent({
  eventDataRef,
  queryRef,
}: Props) {
  const event = useFragment(
    graphql`
      fragment CollectorsNoteAddedToCollectionFeedEventFragment on CollectorsNoteAddedToCollectionFeedEventData {
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
        newCollectorsNote
      }
    `,
    eventDataRef
  );

  const query = useFragment(
    graphql`
      fragment CollectorsNoteAddedToCollectionFeedEventQueryFragment on Query {
        ...HoverCardOnUsernameFollowFragment
      }
    `,
    queryRef
  );

  const tokensToPreview = useMemo(() => {
    return removeNullValues(event.collection.tokens).slice(0, MAX_PIECES_DISPLAYED);
  }, [event.collection.tokens]) as TokenToPreview[];

  const collectionPagePath = `/${event.owner.username}/${event.collection.dbid}`;
  const track = useTrack();

  const numAdditionalPieces = event.collection.tokens.length - MAX_PIECES_DISPLAYED;
  const showAdditionalPiecesIndicator = numAdditionalPieces > 0;

  const collectionName = unescape(event.collection.name ?? '');

  if (!event.collection.tokens.length) {
    return null;
  }

  return (
    <UnstyledLink
      href={collectionPagePath}
      onClick={() => track('Feed: Clicked Description added to collection event')}
    >
      <StyledEvent>
        <StyledEventHeader>
          <BaseM>
            <HoverCardOnUsername userRef={event.owner} queryRef={query} /> added a description to
            {collectionName ? ' ' : ' their collection'}
            <InteractiveLink to={collectionPagePath}>{collectionName}</InteractiveLink>
          </BaseM>
          <DeprecatedSpacer width={4} />
          <StyledTime>{getTimeSince(event.eventTime)}</StyledTime>
        </StyledEventHeader>
        <DeprecatedSpacer height={8} />
        <StyledQuote>
          <Markdown text={unescape(event.newCollectorsNote ?? '')} inheritLinkStyling />
        </StyledQuote>
        <DeprecatedSpacer height={16} />
        <FeedEventTokenPreviews tokensToPreview={tokensToPreview} />
        {showAdditionalPiecesIndicator && (
          <>
            <DeprecatedSpacer height={8} />
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

const StyledQuote = styled(BaseM)`
  color: ${colors.metal};
  border-left: 2px solid ${colors.porcelain};
  padding-left: 8px;

  @media only screen and ${breakpoints.tablet} {
    max-width: 50%;
  }
`;
