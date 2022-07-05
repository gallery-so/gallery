import breakpoints from 'components/core/breakpoints';
import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, TitleXS } from 'components/core/Text/Text';
import FollowListUsers from 'components/Follow/FollowListUsers';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { MODAL_PADDING_THICC_PX } from 'contexts/modal/constants';
import { useModalActions } from 'contexts/modal/ModalContext';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { getTimeSince } from 'utils/time';
import { UserFollowedUsersFeedEventFragment$key } from '__generated__/UserFollowedUsersFeedEventFragment.graphql';
import { UserFollowedUsersFeedEventQueryFragment$key } from '__generated__/UserFollowedUsersFeedEventQueryFragment.graphql';
import { FeedMode } from '../Feed';
import { StyledEvent, StyledEventHeader, StyledTime } from './EventStyles';
import UserFollowedYouEvent from './UserFollowedYouEvent';

type Props = {
  eventRef: UserFollowedUsersFeedEventFragment$key;
  queryRef: UserFollowedUsersFeedEventQueryFragment$key;
  feedMode: FeedMode;
};

export default function UserFollowedUsersFeedEvent({ eventRef, queryRef, feedMode }: Props) {
  const event = useFragment(
    graphql`
      fragment UserFollowedUsersFeedEventFragment on UserFollowedUsersFeedEventData {
        eventTime
        owner @required(action: THROW) {
          username @required(action: THROW)
          ...FollowButtonUserFragment
        }
        followed @required(action: THROW) {
          user {
            username
            dbid
            bio
          }
          followedBack
        }
      }
    `,

    eventRef
  );

  const query = useFragment(
    graphql`
      fragment UserFollowedUsersFeedEventQueryFragment on Query {
        viewer {
          ... on Viewer {
            user {
              dbid
            }
          }
        }
        ...FollowButtonQueryFragment
      }
    `,
    queryRef
  );

  const { push } = useRouter();

  const viewerUserId = query?.viewer?.user?.dbid;

  // cache first username in followed list, to be displayed when user followed only 1 collector
  const firstFolloweeUsername = event.followed[0]?.user?.username;
  const track = useTrack();

  const handleSeeFollowedUserClick = useCallback(
    (e) => {
      e.preventDefault();
      track('Feed: Clicked see single followed user event');
      void push(`/${firstFolloweeUsername}`);
    },
    [firstFolloweeUsername, push, track]
  );

  // a single Follow feed event can contain multiple follow actions taken by a user within a window of time.
  // We want to display "Followed you" and "Followed you back" actions as distinct events from "Followed x, y, z", so for now the front end will be responsible for splitting these events.

  // Try to find a follow action on the event where the followee id is the viewer id (ie the user in the event followed the viewer)
  const followedYouAction = useMemo(() => {
    if (feedMode === 'WORLDWIDE') {
      return null;
    }
    return event.followed.find((followInfo) => followInfo?.user?.dbid === viewerUserId);
  }, [event.followed, feedMode, viewerUserId]);

  // All follow actions included in the feed event *except* Followed You action
  const genericFollows = useMemo(() => {
    if (feedMode === 'WORLDWIDE') {
      return event.followed;
    }
    return event.followed.filter((followInfo) => followInfo?.user?.dbid !== viewerUserId);
  }, [event.followed, feedMode, viewerUserId]);

  const flattenedGenericFollows = useMemo(() => {
    return genericFollows.map((followInfo) => followInfo?.user);
  }, [genericFollows]);

  const { showModal } = useModalActions();
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const handleSeeMoreClick = useCallback(
    (e) => {
      e.preventDefault();
      track('Feed: Clicked See more followed users event');
      showModal({
        content: (
          <StyledFollowList fullscreen={isMobile}>
            <FollowListUsers userList={flattenedGenericFollows} />
          </StyledFollowList>
        ),
        isFullPage: isMobile,
        isPaddingDisabled: true,
        headerVariant: 'thicc',
      });
    },
    [flattenedGenericFollows, isMobile, showModal, track]
  );

  const followedNoRemainingUsers = genericFollows.length === 0;
  // The event displays different content depending on whether the user followed a single or multiple collectors
  const followedSingleUser = genericFollows.length === 1;

  return (
    <>
      {viewerUserId && followedYouAction && (
        <UserFollowedYouEvent
          username={event.owner.username}
          followInfo={followedYouAction}
          followTimestamp={event.eventTime}
          queryRef={query}
          userRef={event.owner}
        />
      )}
      {followedNoRemainingUsers ? null : followedSingleUser ? (
        <CustomStyledEvent onClick={handleSeeFollowedUserClick}>
          <StyledEventContent>
            <StyledEventHeader>
              <BaseM>
                <InteractiveLink to={`/${event.owner.username}`}>
                  {event.owner.username}
                </InteractiveLink>{' '}
                followed{' '}
                <InteractiveLink to={`/${firstFolloweeUsername}`}>
                  {firstFolloweeUsername}
                </InteractiveLink>
              </BaseM>
              <Spacer width={4} />
              <StyledTime>{getTimeSince(event.eventTime)}</StyledTime>
            </StyledEventHeader>
          </StyledEventContent>
        </CustomStyledEvent>
      ) : (
        <CustomStyledEvent onClick={handleSeeMoreClick}>
          <StyledEventContent>
            <StyledEventHeader>
              <BaseM>
                <InteractiveLink to={`/${event.owner.username}`}>
                  {event.owner.username}
                </InteractiveLink>{' '}
                followed {genericFollows.length} collectors.
              </BaseM>
              <Spacer width={4} />
              <StyledTime>{getTimeSince(event.eventTime)}</StyledTime>
            </StyledEventHeader>
            <Spacer height={16} />
            <StyledSecondaryButton text={'See All'} type="secondary" />
          </StyledEventContent>
        </CustomStyledEvent>
      )}
    </>
  );
}

const StyledFollowList = styled.div<{ fullscreen: boolean }>`
  height: ${({ fullscreen }) => (fullscreen ? '100%' : '640px')};
  width: ${({ fullscreen }) => (fullscreen ? '100%' : '540px')};
  display: flex;
  flex-direction: column;
  padding: ${MODAL_PADDING_THICC_PX}px 8px;
`;

const StyledEventContent = styled.div`
  display: flex;
  flex-direction: column;

  @media only screen and ${breakpoints.tablet} {
    flex-direction: row;
  }
`;

const StyledSecondaryButton = styled(Button)`
  flex-shrink: 0;
  width: 100%;
  @media only screen and ${breakpoints.tablet} {
    width: fit-content;
    align-self: end;
  }
`;

const CustomStyledEvent = styled(StyledEvent)`
  &:hover {
    ${StyledSecondaryButton} {
      ${TitleXS} {
        color: ${colors.offBlack};
      }
      border: 1px solid ${colors.offBlack};
    }
  }
`;
