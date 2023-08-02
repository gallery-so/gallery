import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, BaseS } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { PostDataFragment$key } from '~/generated/PostDataFragment.graphql';
import { PostDataQueryFragment$key } from '~/generated/PostDataQueryFragment.graphql';
import useWindowSize, {
  useBreakpoint,
  useIsMobileOrMobileLargeWindowWidth,
  useIsMobileWindowWidth,
} from '~/hooks/useWindowSize';
import colors from '~/shared/theme/colors';
import { getTimeSince } from '~/shared/utils/time';
import { getCommunityUrlForToken } from '~/utils/getCommunityUrlForToken';

import { getFeedTokenDimensions } from '../dimensions';
import { StyledTime } from '../Events/EventStyles';
import PostDropdown from './PostDropdown';
import PostNftPreview from './PostNftPreview';

type Props = {
  postRef: PostDataFragment$key;
  queryRef: PostDataQueryFragment$key;
};

export default function PostData({ postRef, queryRef }: Props) {
  const post = useFragment(
    graphql`
      fragment PostDataFragment on Post {
        __typename
        dbid
        caption
        author @required(action: THROW) {
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
        ...PostDropdownFragment
      }
    `,
    postRef
  );

  const query = useFragment(
    graphql`
      fragment PostDataQueryFragment on Query {
        ...PostDropdownQueryFragment
      }
    `,
    queryRef
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

  // todo account for tablet
  const isMobile = useIsMobileOrMobileLargeWindowWidth();
  if (isMobile) {
    return (
      <StyledPost gap={12}>
        {/* <VStack gap={6}>
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
            <HStack align="center" gap={4}>
              <StyledTime>{getTimeSince(post.creationTime)}</StyledTime>
              <PostDropdown postRef={post} queryRef={query} />
            </HStack>
          </HStack>
          <StyledCaption>{post.caption}</StyledCaption>
        </VStack> */}
        <StyledTokenContainer justify="center" align="center">
          {token ? (
            <PostNftPreview tokenRef={token} tokenSize={tokenSize} />
          ) : (
            <BaseM color={colors.shadow}>There was an error displaying this item</BaseM>
          )}
        </StyledTokenContainer>
      </StyledPost>
    );
  }

  return <StyledPost></StyledPost>;
}

const StyledPost = styled(VStack)`
  max-height: 100%;
`;

const StyledTokenContainer = styled(HStack)`
  padding: 24px 0;
  border: 1px solid ${colors.faint};
`;
