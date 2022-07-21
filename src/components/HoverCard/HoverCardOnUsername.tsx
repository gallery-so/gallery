import { useCallback, useState } from 'react';
import colors from 'components/core/colors';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import { BaseM, TitleM } from 'components/core/Text/Text';
import IconButton from 'components/IconButton/IconButton';
import styled from 'styled-components';
import { graphql, useFragment } from 'react-relay';
import { HoverCardOnUsernameFragment$key } from '__generated__/HoverCardOnUsernameFragment.graphql';
import router from 'next/router';
import Markdown from 'components/core/Markdown/Markdown';
import unescape from 'lodash/unescape';
import FollowButton from 'components/Follow/FollowButton';

type Props = {
  username: string;
  userRef: HoverCardOnUsernameFragment$key;
};

export default function HoverCardOnUsername({ username, userRef }: Props) {
  const [isHovering, setIsHovering] = useState(false);

  const user = useFragment(
    graphql`
      fragment HoverCardOnUsernameFragment on GalleryUser {
        username
        bio
        galleries @required(action: THROW) {
          collections {
            dbid
            name
          }
        }
      }
    `,
    userRef
  );

  const totalCollections = user?.galleries[0]?.collections?.length || 0;

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleClick = useCallback(
    (e) => {
      e.preventDefault();
      router.push(`/${username}`);
    },
    [username]
  );

  // TODO: refactor this to use useLoggedInUserId
  const isLoggedIn = false;

  return (
    <StyledContainer onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <StyledLinkContainer>
        <InteractiveLink to={`/${username}`}>{username} test</InteractiveLink>
      </StyledLinkContainer>

      {isHovering && (
        <StyledCardContainer onClick={handleClick}>
          <StyledCardHeader>
            <StyledHoverCardTitleContainer>
              {isLoggedIn && <FollowButton />}
              <StyledCardUsername>{user.username}</StyledCardUsername>
            </StyledHoverCardTitleContainer>

            <BaseM>{totalCollections} collections</BaseM>
          </StyledCardHeader>
          {user.bio && (
            <StyledCardDescription>
              <BaseM>
                <Markdown text={unescape(user.bio)}></Markdown>
              </BaseM>
            </StyledCardDescription>
          )}
        </StyledCardContainer>
      )}
    </StyledContainer>
  );
}

const StyledContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const StyledLinkContainer = styled.div`
  display: inline-block;
`;

const StyledCardContainer = styled.div`
  border: 1px solid ${colors.offBlack};
  padding: 16px;
  width: 375px;
  display: grid;
  gap: 8px;

  position: absolute;
  background-color: ${colors.white};
  z-index: 1;
  top: 100%;
  /* top: calc(100% + 8px); */
`;

const StyledCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledHoverCardTitleContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StyledCardUsername = styled(TitleM)`
  font-style: normal;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 200px;
`;

const StyledCardDescription = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;
