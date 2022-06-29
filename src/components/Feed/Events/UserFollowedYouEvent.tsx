import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM } from 'components/core/Text/Text';
import FollowButton from 'components/Follow/FollowButton';
import styled from 'styled-components';
import { getTimeSince } from 'utils/time';
import { StyledEvent, StyledEventHeader, StyledTime } from './Event';

type Props = {
  username: string;
  queryRef: any;
  userRef: any;
  followInfo: any;
};

export default function UserFollowedYouEvent({ followInfo, username, queryRef, userRef }: Props) {
  return (
    <StyledEvent>
      <StyledEventContent>
        <StyledEventHeader>
          <BaseM>
            <InteractiveLink to={`/${username}`}>{username}</InteractiveLink> followed you{' '}
            {followInfo.followedBack && 'back'}
          </BaseM>
          <Spacer width={4} />
          <StyledTime>{getTimeSince(followInfo.eventTime)}</StyledTime>
        </StyledEventHeader>
        {!followInfo.followedBack && <FollowButton userRef={userRef} queryRef={queryRef} />}
      </StyledEventContent>
    </StyledEvent>
  );
}

const StyledEventContent = styled.div`
  display: flex;
`;
