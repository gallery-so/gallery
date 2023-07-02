import { Route } from 'nextjs-routes';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import { UnstyledLink } from '~/components/core/Link/UnstyledLink';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, BaseS } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { CollectionUpdatedFeedEventFragment$key } from '~/generated/CollectionUpdatedFeedEventFragment.graphql';
import { CollectionUpdatedFeedEventQueryFragment$key } from '~/generated/CollectionUpdatedFeedEventQueryFragment.graphql';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import colors from '~/shared/theme/colors';
import { getTimeSince } from '~/shared/utils/time';
import unescape from '~/shared/utils/unescape';
import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';
import { pluralize } from '~/utils/string';

import { MAX_PIECES_DISPLAYED_PER_FEED_EVENT } from '../constants';
import FeedEventTokenPreviews from '../FeedEventTokenPreviews';
import { StyledEvent, StyledEventHeader, StyledEventText, StyledTime } from './EventStyles';

type Props = {
  eventDataRef: CollectionUpdatedFeedEventFragment$key;
  queryRef: CollectionUpdatedFeedEventQueryFragment$key;
  isSubEvent?: boolean;
};

export default function CollectionUpdatedFeedEvent({
  eventDataRef,
  queryRef,
  isSubEvent = false,
}: Props) {
  const event = useFragment(
    graphql`
      fragment CollectionUpdatedFeedEventFragment on CollectionUpdatedFeedEventData {
        eventTime
        owner @required(action: THROW) {
          username
          ...HoverCardOnUsernameFragment
          ...ProfilePictureFragment
        }
        collection @required(action: THROW) {
          dbid
          name
        }
        newCollectorsNote @required(action: THROW)
        newTokens @required(action: THROW) {
          ...FeedEventTokenPreviewsFragment
        }
      }
    `,
    eventDataRef
  );

  const query = useFragment(
    graphql`
      fragment CollectionUpdatedFeedEventQueryFragment on Query {
        ...FeedEventTokenPreviewsQueryFragment
        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

  const isPfpEnabled = isFeatureEnabled(FeatureFlag.PFP, query);

  const tokensToPreview = useMemo(() => {
    return removeNullValues(event.newTokens).slice(0, MAX_PIECES_DISPLAYED_PER_FEED_EVENT);
  }, [event.newTokens]);

  const collectionPagePath: Route = {
    pathname: '/[username]/[collectionId]',
    query: { username: event.owner.username as string, collectionId: event.collection.dbid },
  };
  const track = useTrack();

  const numAdditionalPieces = event.newTokens.length - MAX_PIECES_DISPLAYED_PER_FEED_EVENT;
  const showAdditionalPiecesIndicator = numAdditionalPieces > 0;

  const collectionName = unescape(event.collection.name ?? '');

  if (!event.newTokens.length) {
    throw new Error('Tried to render CollectionUpdatedFeedEvent without any tokens');
  }

  return (
    <UnstyledLink
      href={collectionPagePath}
      onClick={() => track('Feed: Clicked collection updated event')}
    >
      <StyledEvent isSubEvent={isSubEvent}>
        <VStack gap={16}>
          <StyledEventHeader>
            <HStack gap={4} inline>
              <StyledEventText isSubEvent={isSubEvent}>
                {!isSubEvent && (
                  <HStack align="center" gap={4}>
                    {isPfpEnabled && <ProfilePicture userRef={event.owner} size="sm" />}
                    <HoverCardOnUsername userRef={event.owner} />
                  </HStack>
                )}{' '}
                made updates to {collectionName ? ' ' : 'their collection'}
                <InteractiveLink to={collectionPagePath}>{collectionName}</InteractiveLink>
              </StyledEventText>
              {!isSubEvent && <StyledTime>{getTimeSince(event.eventTime)}</StyledTime>}
            </HStack>
          </StyledEventHeader>
          <StyledQuote>
            <Markdown text={unescape(event.newCollectorsNote ?? '')} inheritLinkStyling />
          </StyledQuote>
          <VStack gap={8}>
            <FeedEventTokenPreviews
              isInCaption={false}
              tokenToPreviewRefs={tokensToPreview}
              queryRef={query}
            />
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
const StyledQuote = styled(BaseM)`
  color: ${colors.metal};
  border-left: 2px solid ${colors.porcelain};
  padding-left: 8px;

  @media only screen and ${breakpoints.tablet} {
    max-width: 50%;
  }
`;
