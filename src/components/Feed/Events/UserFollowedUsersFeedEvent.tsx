import breakpoints from 'components/core/breakpoints';
import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, TitleXS } from 'components/core/Text/Text';
import FollowListUsers from 'components/Follow/FollowListUsers';
import { MODAL_PADDING_THICC_PX } from 'contexts/modal/constants';
import { useModalActions } from 'contexts/modal/ModalContext';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { getTimeSince } from 'utils/time';
import { StyledEvent, StyledEventHeader, StyledTime } from './Event';
import UserFollowedYouEvent from './UserFollowedYouEvent';

type Props = {
  eventRef: any;
  queryRef?: any;
};

export default function UserFollowedUsersFeedEvent({ eventRef, queryRef }: Props) {
  const event = useFragment(
    graphql`
      fragment UserFollowedUsersFeedEventFragment on UserFollowedUsersFeedEventData {
        eventTime
        owner {
          username
          ...FollowButtonUserFragment
        }
        followed {
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

  const viewerUserId = query?.viewer?.user.dbid;

  // const followEventMock = {
  //   owner: {
  //     username: 'ronald',
  //   },
  //   followed: [
  //     {
  //       followedBack: false,
  //       user: {
  //         username: 'Benny',
  //         dbid: '1234',
  //       },
  //     },
  //     {
  //       followedBack: false,
  //       user: {
  //         username: 'Kaito',
  //         dbid: '2AvDukjqIjU6H92ECmiUfXal1x1',
  //       },
  //     },
  //     {
  //       followedBack: true,
  //       user: {
  //         username: 'Robin',
  //         dbid: '423',
  //       },
  //     },
  //   ],
  // };

  const handleSeeFollowedUserClick = useCallback(() => {
    void push(`/${event.followed[0].user.username}`);
  }, [event.followed, push]);

  // const;

  // a single Follow event can contain multiple follow actions taken by a user within a window of time.
  // We want to display "Followed you" and "Followed you back" actions as distinct events from "Followed x, y, z", so for now the front end will be responsible for splitting these events.

  // Try to find a follow action on the event where the followee id is the viewer id
  const followedYouAction = useMemo(() => {
    return event.followed.find((followInfo) => followInfo.user.dbid === viewerUserId);
  }, [event.followed, viewerUserId]);

  // All follow actions except Followed You action
  const genericFollows = useMemo(() => {
    return event.followed.filter((followInfo) => followInfo.user.dbid !== viewerUserId);
  }, [event.followed, viewerUserId]);

  const flattenedGenericFollows = useMemo(() => {
    return genericFollows.map((followInfo) => followInfo.user);
  }, [genericFollows]);

  const { showModal } = useModalActions();
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const handleSeeMoreClick = useCallback(
    (e) => {
      e.preventDefault();
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
    [flattenedGenericFollows, isMobile, showModal]
  );

  // The event displays different content depending on whether the user followed a single or multiple collectors
  const followedSingleUser = genericFollows.length === 1;

  return (
    <>
      {viewerUserId && followedYouAction && (
        <UserFollowedYouEvent
          username={event.owner.username}
          followInfo={followedYouAction}
          queryRef={query}
          userRef={event.owner}
        />
      )}
      {followedSingleUser ? (
        <CustomStyledEvent onClick={handleSeeFollowedUserClick}>
          <StyledEventContent>
            <StyledEventHeader>
              <BaseM>
                <InteractiveLink to={`/${event.owner.username}`}>
                  {event.owner.username}
                </InteractiveLink>{' '}
                followed{' '}
                <InteractiveLink to={`/${event.followed[0].user.username}`}>
                  {event.followed[0].user.username}
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

  @media only screen and ${breakpoints.desktop} {
    flex-direction: row;
  }
`;

const StyledSecondaryButton = styled(Button)`
  flex-shrink: 0;
  width: 100%;
  @media only screen and ${breakpoints.desktop} {
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
