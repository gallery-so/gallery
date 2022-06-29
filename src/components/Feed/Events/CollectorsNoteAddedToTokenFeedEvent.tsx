import breakpoints from 'components/core/breakpoints';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import Spacer from 'components/core/Spacer/Spacer';
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

type Props = {
  eventRef: CollectorsNoteAddedToTokenFeedEventFragment$key;
};

const MARGIN = 16;
const MIDDLE_GAP = 24;
// images will be rendered within a square of this size
const IMAGE_SPACE_SIZE = 269;

export default function CollectorsNoteAddedToTokenFeedEvent({ eventRef }: Props) {
  const event = useFragment(
    graphql`
      fragment CollectorsNoteAddedToTokenFeedEventFragment on CollectorsNoteAddedToTokenFeedEventData {
        eventTime
        owner @required(action: THROW) {
          username
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
  const isMobile = useIsMobileWindowWidth();
  const windowSize = useWindowSize();
  const { showModal } = useModalActions();

  const size = isMobile ? (windowSize.width - 2 * MARGIN - MIDDLE_GAP) / 2 : IMAGE_SPACE_SIZE;

  const nftDetailPath = `/${event.owner.username}/${event.token.collection?.dbid}/${event.token.token?.dbid}`;

  const handleEventClick = useCallback(() => {
    showModal({
      content: (
        <StyledNftDetailViewPopover>
          <NftDetailView
            username={'kaito'}
            authenticatedUserOwnsAsset={false}
            queryRef={event.token}
          />
        </StyledNftDetailViewPopover>
      ),
      isFullPage: true,
    });
  }, [event, showModal]);

  return (
    <StyledEvent>
      <StyledClickHandler>
        <StyledEventHeader>
          <BaseM>
            <InteractiveLink to={`/${event.owner.username}`}>
              {event.owner.username}
            </InteractiveLink>{' '}
            added a collector's note to{' '}
            <InteractiveLink
              to={`/${event.owner.username}/${event.token.collection?.dbid}/${event.token.token?.dbid}`}
            >
              {event.token.token?.name}
            </InteractiveLink>
          </BaseM>
          <Spacer width={4} />
          <StyledTime>{getTimeSince(event.eventTime)}</StyledTime>
        </StyledEventHeader>
        <Spacer height={16} />
        <StyledContent>
          <StyledMediaWrapper>
            <EventMedia tokenRef={event.token} maxHeight={size} maxWidth={size} />
          </StyledMediaWrapper>
          <Spacer width={MIDDLE_GAP} />
          <StyledNoteWrapper>
            <StyledNote>{event.newCollectorsNote}</StyledNote>
          </StyledNoteWrapper>
        </StyledContent>
      </StyledClickHandler>
    </StyledEvent>
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

const StyledContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

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
