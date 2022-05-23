import TextButton from 'components/core/Button/TextButton';
import Tooltip, { StyledTooltipParent } from 'components/Tooltip/Tooltip';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { FollowerCountFragment$key } from '__generated__/FollowerCountFragment.graphql';
import FollowList from './FollowList';
import { useModalActions } from 'contexts/modal/ModalContext';

type Props = {
  userRef: FollowerCountFragment$key;
};

export default function FollowerCount({ userRef }: Props) {
  const user = useFragment(
    graphql`
      fragment FollowerCountFragment on GalleryUser {
        followers {
          dbid
        }
        following {
          dbid
        }
        ...FollowListFragment
      }
    `,
    userRef
  );

  const { showModal } = useModalActions();

  const handleClick = useCallback(() => {
    showModal(<FollowList userRef={user}></FollowList>);
  }, [showModal, user]);

  const followerCount = useMemo(() => user.followers.length, [user.followers]);
  const followingCount = useMemo(() => user.following.length, [user.following]);

  return (
    <StyledFollowerCount>
      <StyledTooltipParent>
        <TextButton text={`${user.followers.length}`} onClick={handleClick}></TextButton>
        <Tooltip
          text={`See ${followerCount} follower${
            followerCount > 1 ? 's' : ''
          } and ${followingCount} following`}
        />
      </StyledTooltipParent>
    </StyledFollowerCount>
  );
}

const StyledFollowerCount = styled.div``;
