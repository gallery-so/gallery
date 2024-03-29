import { MouseEventHandler, useCallback, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleM } from '~/components/core/Text/Text';
import UserHoverCard from '~/components/HoverCard/UserHoverCard';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { CollectorsNoteAddedToTokenFeedEventFragment$key } from '~/generated/CollectorsNoteAddedToTokenFeedEventFragment.graphql';
import { CollectorsNoteAddedToTokenFeedEventQueryFragment$key } from '~/generated/CollectorsNoteAddedToTokenFeedEventQueryFragment.graphql';
import useWindowSize, { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import NftDetailView from '~/scenes/NftDetailPage/NftDetailView';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { getTimeSince } from '~/shared/utils/time';
import unescape from '~/shared/utils/unescape';

import EventMedia from './EventMedia';
import {
  StyledClickHandler,
  StyledEvent,
  StyledEventContent,
  StyledEventHeader,
  StyledEventLabel,
  StyledEventText,
  StyledTime,
} from './EventStyles';

type Props = {
  isSubEvent?: boolean;
  queryRef: CollectorsNoteAddedToTokenFeedEventQueryFragment$key;
  eventDataRef: CollectorsNoteAddedToTokenFeedEventFragment$key;
};

const MARGIN = 16;
const MIDDLE_GAP = 24;
// images will be rendered within a square of this size
const IMAGE_SPACE_SIZE = 269;

export default function CollectorsNoteAddedToTokenFeedEvent({
  queryRef,
  eventDataRef,
  isSubEvent = false,
}: Props) {
  const query = useFragment(
    graphql`
      fragment CollectorsNoteAddedToTokenFeedEventQueryFragment on Query {
        ...NftDetailViewQueryFragment
        ...EventMediaQueryFragment
      }
    `,
    queryRef
  );

  const event = useFragment(
    graphql`
      fragment CollectorsNoteAddedToTokenFeedEventFragment on CollectorsNoteAddedToTokenFeedEventData {
        eventTime
        owner @required(action: THROW) {
          ...UserHoverCardFragment
          ...ProfilePictureFragment
        }
        newCollectorsNote
        token @required(action: THROW) {
          token @required(action: THROW) {
            definition {
              name
            }
          }
          ...EventMediaFragment
          ...NftDetailViewFragment
        }
      }
    `,
    eventDataRef
  );

  const isMobile = useIsMobileWindowWidth();
  const windowSize = useWindowSize();
  const { showModal } = useModalActions();

  const size = isMobile ? (windowSize.width - 2 * MARGIN - MIDDLE_GAP) / 2 : IMAGE_SPACE_SIZE;
  const track = useTrack();

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const toggleLightbox = useCallback(() => {
    setIsLightboxOpen((prev) => !prev);
  }, []);

  const handleEventClick = useCallback<MouseEventHandler>(
    (e) => {
      e.preventDefault();
      track('Feed: Clicked collectors note added to token event');

      showModal({
        content: (
          <StyledNftDetailViewPopover>
            <NftDetailView
              queryRef={query}
              authenticatedUserOwnsAsset={false}
              collectionTokenRef={event.token}
              isLightboxOpen={isLightboxOpen}
              toggleLightbox={toggleLightbox}
            />
          </StyledNftDetailViewPopover>
        ),
        isFullPage: true,
      });
    },
    [track, showModal, query, event.token, isLightboxOpen, toggleLightbox]
  );

  return (
    <StyledClickHandler onClick={handleEventClick}>
      <StyledEvent isSubEvent={isSubEvent}>
        <VStack gap={isSubEvent ? 0 : 16}>
          <StyledEventHeader>
            <StyledEventText isSubEvent={isSubEvent}>
              {!isSubEvent && (
                <HStack gap={4} align="center">
                  <ProfilePicture userRef={event.owner} size="sm" />
                  <UserHoverCard userRef={event.owner} />
                </HStack>
              )}
              <BaseM>add a collector's note to</BaseM>
              <StyledEventLabel>{event.token.token?.definition?.name}</StyledEventLabel>
            </StyledEventText>
            {!isSubEvent && <StyledTime>{getTimeSince(event.eventTime)}</StyledTime>}
          </StyledEventHeader>

          <StyledEventContent align="center" justify="center" isSubEvent={isSubEvent}>
            <StyledContent align="center" justify="center" gap={MIDDLE_GAP}>
              <StyledMediaWrapper align="center">
                <EventMedia
                  tokenRef={event.token}
                  maxHeight={size}
                  maxWidth={size}
                  queryRef={query}
                />
              </StyledMediaWrapper>
              {event.newCollectorsNote && (
                <StyledNoteWrapper>
                  <StyledNote>
                    <Markdown
                      text={unescape(event.newCollectorsNote ?? '')}
                      inheritLinkStyling
                      eventContext={contexts.Feed}
                    />
                  </StyledNote>
                </StyledNoteWrapper>
              )}
            </StyledContent>
          </StyledEventContent>
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

const StyledMediaWrapper = styled(VStack)`
  width: 50%;
`;

const StyledContent = styled(HStack)`
  width: 100%;
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
