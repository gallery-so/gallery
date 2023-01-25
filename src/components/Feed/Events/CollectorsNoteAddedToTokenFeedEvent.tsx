import Link from 'next/link';
import { MouseEventHandler, useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleM } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { CollectorsNoteAddedToTokenFeedEventFragment$key } from '~/generated/CollectorsNoteAddedToTokenFeedEventFragment.graphql';
import { CollectorsNoteAddedToTokenFeedEventQueryFragment$key } from '~/generated/CollectorsNoteAddedToTokenFeedEventQueryFragment.graphql';
import useWindowSize, { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import NftDetailView from '~/scenes/NftDetailPage/NftDetailView';
import { getTimeSince } from '~/utils/time';
import unescape from '~/utils/unescape';

import EventMedia from './EventMedia';
import {
  StyledClickHandler,
  StyledEvent,
  StyledEventHeader,
  StyledEventLabel,
  StyledTime,
} from './EventStyles';

type Props = {
  isSubEvent?: boolean;
  eventDataRef: CollectorsNoteAddedToTokenFeedEventFragment$key;
  queryRef: CollectorsNoteAddedToTokenFeedEventQueryFragment$key;
};

const MARGIN = 16;
const MIDDLE_GAP = 24;
// images will be rendered within a square of this size
const IMAGE_SPACE_SIZE = 269;

export default function CollectorsNoteAddedToTokenFeedEvent({
  eventDataRef,
  isSubEvent = false,
  queryRef,
}: Props) {
  const event = useFragment(
    graphql`
      fragment CollectorsNoteAddedToTokenFeedEventFragment on CollectorsNoteAddedToTokenFeedEventData {
        eventTime
        owner @required(action: THROW) {
          username
          ...HoverCardOnUsernameFragment
        }
        newCollectorsNote
        token @required(action: THROW) {
          token @required(action: THROW) {
            dbid
            name
          }
          collection {
            dbid
          }
          ...EventMediaFragment
          ...NftDetailViewFragment
        }
      }
    `,
    eventDataRef
  );

  const query = useFragment(
    graphql`
      fragment CollectorsNoteAddedToTokenFeedEventQueryFragment on Query {
        ...HoverCardOnUsernameFollowFragment
      }
    `,
    queryRef
  );

  const isMobile = useIsMobileWindowWidth();
  const windowSize = useWindowSize();
  const { showModal } = useModalActions();

  const size = isMobile ? (windowSize.width - 2 * MARGIN - MIDDLE_GAP) / 2 : IMAGE_SPACE_SIZE;
  const track = useTrack();

  const handleEventClick = useCallback<MouseEventHandler>(
    (e) => {
      e.preventDefault();
      track('Feed: Clicked collectors note added to token event');

      showModal({
        content: (
          <StyledNftDetailViewPopover>
            <NftDetailView authenticatedUserOwnsAsset={false} queryRef={event.token} />
          </StyledNftDetailViewPopover>
        ),
        isFullPage: true,
      });
    },
    [event.token, showModal, track]
  );

  return (
    <StyledClickHandler onClick={handleEventClick}>
      <StyledEvent isSubEvent={isSubEvent}>
        <VStack gap={isSubEvent ? 0 : 16}>
          <StyledEventHeader>
            <HStack gap={4} inline>
              <BaseM>
                {isSubEvent ? (
                  <>Added a collector's note to</>
                ) : (
                  <>
                    <HoverCardOnUsername userRef={event.owner} queryRef={query} /> added a
                    collector's note to
                  </>
                )}{' '}
                <Link
                  href={{
                    pathname: '/[username]/[collectionId]/[tokenId]',
                    query: {
                      username: event.owner.username as string,
                      collectionId: event.token.collection?.dbid as string,
                      tokenId: event.token.token?.dbid,
                    },
                  }}
                  onClick={handleEventClick}
                >
                  <StyledEventLabel>{event.token.token?.name}</StyledEventLabel>
                </Link>
              </BaseM>
              <StyledTime>{getTimeSince(event.eventTime)}</StyledTime>
            </HStack>
          </StyledEventHeader>
          <StyledContent justify="center" align="center" gap={MIDDLE_GAP}>
            <StyledMediaWrapper>
              <EventMedia tokenRef={event.token} maxHeight={size} maxWidth={size} />
            </StyledMediaWrapper>
            <StyledNoteWrapper>
              <StyledNote>
                <Markdown text={unescape(event.newCollectorsNote ?? '')} inheritLinkStyling />
              </StyledNote>
            </StyledNoteWrapper>
          </StyledContent>
        </VStack>
      </StyledEvent>
    </StyledClickHandler>
  );
}

const StyledNote = styled(TitleM)`
  -webkit-line-clamp: 4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 4;
  display: -webkit-box;
  text-overflow: ellipsis;

  * {
    margin: 0;
    padding: 0;
    display: inline;
  }
`;

const StyledMediaWrapper = styled.div`
  width: 50%;
`;

const StyledContent = styled(HStack)`
  @media only screen and ${breakpoints.desktop} {
    margin: 0 80px;
  }
`;

const StyledNoteWrapper = styled.div`
  width: 50%;
`;

const StyledNftDetailViewPopover = styled.div`
  display: flex;
  justify-content: center;
  height: 100%;
  padding: 80px 0;

  @media only screen and ${breakpoints.desktop} {
    padding: 0;
  }
`;
