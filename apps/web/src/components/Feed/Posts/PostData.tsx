import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, BaseS } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import NftPreviewAsset from '~/components/NftPreview/NftPreviewAsset';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { PostDataFragment$key } from '~/generated/PostDataFragment.graphql';
import colors from '~/shared/theme/colors';
import { getTimeSince } from '~/shared/utils/time';
import { getCommunityUrlForToken } from '~/utils/getCommunityUrlForToken';

import { StyledTime } from '../Events/EventStyles';

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
            username
            ...ProfilePictureFragment
            ...HoverCardOnUsernameFragment
          }
        }
        tokens {
          community {
            name
          }
          ...NftPreviewAssetFragment
          ...getCommunityUrlForTokenFragment
        }
        creationTime
      }
    `,
    postRef
  );

  if (!post.tokens) {
    return null;
  }

  const token = post.tokens[0];
  const communityUrl = getCommunityUrlForToken(token);

  return (
    <StyledPost gap={8}>
      <VStack gap={12}>
        <HStack justify="space-between">
          <HStack align="center" gap={6}>
            <ProfilePicture userRef={post.author} size="md" />
            <VStack>
              <HoverCardOnUsername userRef={post.author} />
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
      </VStack>
      <BaseM>{post.caption}</BaseM>
      <HStack justify="center">
        <StyledAsset>
          <NftPreviewAsset tokenRef={token} />
        </StyledAsset>
      </HStack>
    </StyledPost>
  );
}

const StyledAsset = styled.div`
  display: flex;
  width: 450px;
  height: 450px;

  max-width: 450px;
  max-height: 450px;
`;

const StyledPost = styled(VStack)`
  max-height: 100%;
`;

const StyledInteractiveLink = styled(InteractiveLink)`
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;
