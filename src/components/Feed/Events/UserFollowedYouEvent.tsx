import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM } from 'components/core/Text/Text';
import FollowButton from 'components/Follow/FollowButton';
import styled from 'styled-components';
import { getTimeSince } from 'utils/time';
import { FollowButtonQueryFragment$key } from '__generated__/FollowButtonQueryFragment.graphql';
import { FollowButtonUserFragment$key } from '__generated__/FollowButtonUserFragment.graphql';
import { StyledEvent, StyledEventHeader, StyledTime } from './EventStyles';

type Props = {
  username: string;
  queryRef: FollowButtonQueryFragment$key;
  userRef: FollowButtonUserFragment$key;
  followInfo: any;
  followTimestamp: any;
};

export default function UserFollowedYouEvent({
  followInfo,
  followTimestamp,
  username,
  queryRef,
  userRef,
}: Props) {
  return (
    <StyledEvent>
      <StyledEventContent>
        <StyledEventHeader>
          <BaseM>
            <InteractiveLink to={`/${username}`}>{username}</InteractiveLink> followed you{' '}
            {followInfo.followedBack && 'back'}
          </BaseM>
          <Spacer width={4} />
          <StyledTime>{getTimeSince(followTimestamp)}</StyledTime>
        </StyledEventHeader>
        {!followInfo.followedBack && <FollowButton userRef={userRef} queryRef={queryRef} />}
      </StyledEventContent>
    </StyledEvent>
  );
}

const StyledEventContent = styled.div`
  display: flex;
  align-items: center;
`;
