import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, BaseS } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { PostDataFragment$key } from '~/generated/PostDataFragment.graphql';
import useWindowSize, { useBreakpoint } from '~/hooks/useWindowSize';
import colors from '~/shared/theme/colors';
import { getTimeSince } from '~/shared/utils/time';
import { getCommunityUrlForToken } from '~/utils/getCommunityUrlForToken';

import { getFeedTokenDimensions } from '../dimensions';
import { StyledTime } from '../Events/EventStyles';
import PostNftPreview from './PostNftPreview';

type Props = {
  postRef: PostDataFragment$key;
};

export default function PostData({ postRef }: Props) {
  const post = useFragment(
    graphql`
      fragment PostDataFragment on Post {
        __typename
        dbid
        caption
        author {
          ... on GalleryUser {
            ...ProfilePictureFragment
            ...HoverCardOnUsernameFragment
          }
        }
        tokens {
          community {
            name
          }
          ...getCommunityUrlForTokenFragment
          ...PostNftPreviewFragment
        }
        creationTime
      }
    `,
    postRef
  );

  const breakpoint = useBreakpoint();
  const { width } = useWindowSize();

  const tokenSize = useMemo(() => {
    return getFeedTokenDimensions({
      numTokens: '1',
      maxWidth: width,
      breakpoint,
    });
  }, [breakpoint, width]);

  if (!post.tokens) {
    reportError(`PostData: post.tokens is null - ${post.dbid}`);
  }

  const token = post.tokens && post.tokens[0];
  const communityUrl = token ? getCommunityUrlForToken(token) : null;

  return (
    <StyledPost gap={12}>
      <VStack gap={6}>
        <HStack justify="space-between">
          <HStack align="center" gap={6}>
            {post.author && <ProfilePicture userRef={post.author} size="md" />}
            <VStack>
              {post.author && <HoverCardOnUsername userRef={post.author} />}
              {communityUrl ? (
                <StyledInteractiveLink to={communityUrl}>
                  <BaseS color={colors.shadow}>{token?.community?.name}</BaseS>
                </StyledInteractiveLink>
              ) : (
                <BaseS color={colors.shadow}>{token?.community?.name}</BaseS>
              )}
            </VStack>
          </HStack>
          <StyledTime>{getTimeSince(post.creationTime)}</StyledTime>
        </HStack>
        <StyledCaption>{post.caption}</StyledCaption>
      </VStack>
      <StyledTokenContainer justify="center" align="center">
        {token && <PostNftPreview tokenRef={token} tokenSize={tokenSize} />}
        {!token && <BaseM color={colors.shadow}>There was an error displaying this item</BaseM>}
      </StyledTokenContainer>
    </StyledPost>
  );
}

const StyledPost = styled(VStack)`
  max-height: 100%;
`;

const StyledInteractiveLink = styled(InteractiveLink)`
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const StyledCaption = styled(BaseM)`
  overflow-wrap: break-word;
`;

const StyledTokenContainer = styled(HStack)`
  padding: 24px 0;
  border: 1px solid ${colors.faint};
`;
