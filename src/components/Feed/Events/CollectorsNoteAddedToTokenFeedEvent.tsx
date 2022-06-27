import breakpoints from 'components/core/breakpoints';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, TitleM } from 'components/core/Text/Text';
import useWindowSize, { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { getTimeSince } from 'utils/time';
import { StyledClickHandler, StyledEvent, StyledEventHeader, StyledTime } from './Event';
import EventMedia from './EventMedia';

type Props = {
  eventRef: any;
};

const MARGIN = 16;
const MIDDLE_GAP = 24;

export default function CollectorsNoteAddedToTokenFeedEvent({ eventRef }: Props) {
  const event = useFragment(
    graphql`
      fragment CollectorsNoteAddedToTokenFeedEventFragment on CollectorsNoteAddedToTokenFeedEvent {
        dbid
        eventTime
        owner {
          username
        }
        newCollectorsNote
        token {
          token {
            dbid
            name
          }
          collection {
            dbid
          }
          ...EventMediaFragment
        }
      }
    `,
    eventRef
  );
  const isMobile = useIsMobileWindowWidth();
  const windowSize = useWindowSize();
  const { push } = useRouter();

  // values taken from figma
  const size = isMobile ? (windowSize.width - 2 * MARGIN - MIDDLE_GAP) / 2 : 269;

  const nftDetailPath = `/${event.owner.username}/${event.token.collection.dbid}/${event.token.token.dbid}`;

  const handleEventClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault();
      void push(nftDetailPath);
    },
    [nftDetailPath, push]
  );

  return (
    <StyledEvent>
      <StyledClickHandler href={nftDetailPath} onClick={handleEventClick}>
        <StyledEventHeader>
          <BaseM>
            <InteractiveLink to={`/${event.owner.username}`}>
              {event.owner.username}
            </InteractiveLink>{' '}
            added a collector's note to{' '}
            <InteractiveLink to={`/${event.owner.username}/${event.token.dbid}`}>
              {/* TODO FIX URL */}
              {event.token.token.name}
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
          {/* <FeedEventTokenPreviews tokensToPreview={[event.token]} /> */}
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
