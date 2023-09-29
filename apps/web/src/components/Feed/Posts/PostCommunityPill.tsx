import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { TitleDiatypeM } from '~/components/core/Text/Text';
import CommunityHoverCard from '~/components/HoverCard/CommunityHoverCard';
import { ButtonPill } from '~/components/Pill';
import { PostCommunityPillFragment$key } from '~/generated/PostCommunityPillFragment.graphql';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import colors from '~/shared/theme/colors';
type Props = {
  postRef: PostCommunityPillFragment$key;
};

export default function PostCommunityPill({ postRef }: Props) {
  const post = useFragment(
    graphql`
      fragment PostCommunityPillFragment on Post {
        tokens {
          community {
            name
            ...CommunityHoverCardFragment
          }
        }
      }
    `,
    postRef
  );

  const token = post.tokens && post.tokens[0];

  const track = useTrack();

  const handleClick = useCallback(() => {
    track('Clicked Post Community Pill', { community: token?.community?.name });
  }, [token?.community?.name, track]);

  if (!token?.community) {
    return null;
  }

  return (
    <CommunityHoverCard communityRef={token.community} onClick={handleClick}>
      <StyledPill>
        <StyledCommunityName>{token?.community.name}</StyledCommunityName>
      </StyledPill>
    </CommunityHoverCard>
  );
}

const StyledPill = styled(ButtonPill)`
  background-color: ${colors.white};
  color: ${colors.black['800']};
  height: 28px;
  padding: 4px 12px;

  &:hover {
    border-color: ${colors.black['800']};
    background-color: ${colors.white};
  }
`;

const StyledCommunityName = styled(TitleDiatypeM)`
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;
