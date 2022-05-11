import TextButton, { StyledButtonText } from 'components/core/Button/TextButton';
import colors from 'components/core/colors';
import Markdown from 'components/core/Markdown/Markdown';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, TitleS } from 'components/core/Text/Text';
import { useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

type Props = {
  userRef: any;
};

// TODO abbreivate long numbers
export default function FollowList({ userRef }: Props) {
  const user = useFragment(
    graphql`
      fragment FollowListFragment on GalleryUser {
        followers {
          dbid
          username
          bio
        }
        following {
          dbid
          username
          bio
        }
      }
    `,
    userRef
  );

  const [displayedList, setDisplayedList] = useState<'followers' | 'following'>('followers');

  const userList = displayedList === 'followers' ? user.followers : user.following;

  return (
    <StyledFollowList>
      <StyledHeader>
        <StyledHeaderTextRight>
          <StyledTextButton
            text={`Followers ∙ ${user.followers.length}`}
            onClick={() => setDisplayedList('followers')}
            active={displayedList === 'followers'}
          ></StyledTextButton>
        </StyledHeaderTextRight>
        <Spacer width={16} />
        <StyledHeaderText>
          <StyledTextButton
            text={`Following ∙ ${user.following.length}`}
            onClick={() => setDisplayedList('following')}
            active={displayedList === 'following'}
          ></StyledTextButton>
        </StyledHeaderText>
      </StyledHeader>
      <StyledList>
        {userList.map((user: any) => (
          <StyledListItem key={user.dbid} href={`/${user.username}`}>
            <TitleS>{user.username}</TitleS>
            <BaseM>
              <Markdown text={user.bio} />
            </BaseM>
            {/* <BaseM> {user.bio}</BaseM> */}
          </StyledListItem>
        ))}
      </StyledList>
    </StyledFollowList>
  );
}

const StyledFollowList = styled.div`
  height: 640px;
  width: 540px;
  display: flex;
  flex-direction: column;
`;

const StyledHeader = styled.div`
  padding: 24px;
  height: 64px;
  display: flex;
  justify-content: center;
`;

const StyledHeaderText = styled.div`
  display: flex;
`;

const StyledHeaderTextRight = styled(StyledHeaderText)`
  justify-content: flex-end;
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
`;

const StyledListItem = styled.a`
  padding: 16px;
  text-decoration: none;

  &:hover {
    background: ${colors.offWhite};
  }
`;

const StyledTextButton = styled(TextButton)<{ active: boolean }>`
  ${({ active }) =>
    active &&
    `${StyledButtonText} {
    color: ${colors.offBlack};
  }`}
`;
