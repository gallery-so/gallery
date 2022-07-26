import { useState } from 'react';
import colors from 'components/core/colors';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import { BaseM, TitleM } from 'components/core/Text/Text';
import styled, { css, keyframes } from 'styled-components';
import { graphql, useFragment } from 'react-relay';
import { HoverCardOnUsernameFragment$key } from '__generated__/HoverCardOnUsernameFragment.graphql';
import Markdown from 'components/core/Markdown/Markdown';
import unescape from 'lodash/unescape';
import FollowButton from 'components/Follow/FollowButton';
import transitions, {
  ANIMATED_COMPONENT_TRANSLATION_PIXELS_LARGE,
} from 'components/core/transitions';
import { HoverCardOnUsernameFollowFragment$key } from '__generated__/HoverCardOnUsernameFollowFragment.graphql';
import { useLoggedInUserId } from 'hooks/useLoggedInUserId';

type Props = {
  username: string;
  userRef: HoverCardOnUsernameFragment$key;
  queryRef: HoverCardOnUsernameFollowFragment$key;
};

export default function HoverCardOnUsername({ username, userRef, queryRef }: Props) {
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
        ...FollowButtonUserFragment
      }
    `,
    userRef
  );

  const query = useFragment(
    graphql`
      fragment HoverCardOnUsernameFollowFragment on Query {
        ...FollowButtonQueryFragment
        ...useLoggedInUserIdFragment
      }
    `,
    queryRef
  );

  const totalCollections = user?.galleries[0]?.collections?.length || 0;

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const loggedInUserId = useLoggedInUserId(query);
  const isLoggedIn = !!loggedInUserId;

  return (
    <StyledContainer onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <StyledLinkContainer>
        <InteractiveLink to={`/${username}`}>{username}</InteractiveLink>
      </StyledLinkContainer>

      <StyledCardContainer isHovering={isHovering}>
        <StyledCardHeader>
          <StyledHoverCardTitleContainer>
            {isLoggedIn && <FollowButton userRef={user} queryRef={query} />}
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
    </StyledContainer>
  );
}

const translateUp = keyframes`
    from { transform: translateY(${ANIMATED_COMPONENT_TRANSLATION_PIXELS_LARGE}px) };
    to { transform: translateY(0px) };
`;

const translateDown = keyframes`
    from { transform: translateY(0px) };
    to { transform: translateY(${ANIMATED_COMPONENT_TRANSLATION_PIXELS_LARGE}px) };
`;

const StyledContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const StyledLinkContainer = styled.div`
  display: inline-block;
`;

const StyledCardContainer = styled.div<{ isHovering: boolean }>`
  border: 1px solid ${colors.offBlack};
  padding: 16px;
  width: 375px;
  display: grid;
  gap: 8px;

  position: absolute;
  background-color: ${colors.white};
  z-index: ${({ isHovering }) => (isHovering ? '1' : '-1')};
  /* top: calc(100% + 8px); */
  top: calc(100%);

  animation: ${({ isHovering }) =>
    css`
      ${isHovering ? translateUp : translateDown} ${transitions.cubic}
    `};
  opacity: ${({ isHovering }) => (isHovering ? 1 : 0)};
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
