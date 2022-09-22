import breakpoints from 'components/core/breakpoints';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import { BaseM, TitleM } from 'components/core/Text/Text';
import { useModalActions } from 'contexts/modal/ModalContext';
import useWindowSize, { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import NftDetailView from 'scenes/NftDetailPage/NftDetailView';
import styled from 'styled-components';
import { getTimeSince } from 'utils/time';
import { CollectorsNoteAddedToTokenFeedEventFragment$key } from '__generated__/CollectorsNoteAddedToTokenFeedEventFragment.graphql';
import { StyledClickHandler, StyledEvent, StyledEventHeader, StyledTime } from './EventStyles';
import EventMedia from './EventMedia';
import unescape from 'utils/unescape';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import HoverCardOnUsername from 'components/HoverCard/HoverCardOnUsername';
import { CollectorsNoteAddedToTokenFeedEventQueryFragment$key } from '__generated__/CollectorsNoteAddedToTokenFeedEventQueryFragment.graphql';
import Markdown from 'components/core/Markdown/Markdown';
import { HStack, VStack } from 'components/core/Spacer/Stack';

type Props = {
  eventRef: CollectorsNoteAddedToTokenFeedEventFragment$key;
  queryRef: CollectorsNoteAddedToTokenFeedEventQueryFragment$key;
};

const MARGIN = 16;
const MIDDLE_GAP = 24;
// images will be rendered within a square of this size
const IMAGE_SPACE_SIZE = 269;

export default function CollectorsNoteAddedToTokenFeedEvent({ eventRef, queryRef }: Props) {
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
    eventRef
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

  const handleEventClick = useCallback(
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
      <StyledEvent>
        <VStack gap={16}>
          <StyledEventHeader>
            <HStack gap={4} inline>
              <BaseM>
                <HoverCardOnUsername userRef={event.owner} queryRef={query} /> added a collector's
                note to{' '}
                <InteractiveLink
                  to={`/${event.owner.username}/${event.token.collection?.dbid}/${event.token.token?.dbid}`}
                  onClick={handleEventClick}
                >
                  {event.token.token?.name}
                </InteractiveLink>
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
