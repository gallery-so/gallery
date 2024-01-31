import { useRouter } from 'next/router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import { contexts } from 'shared/analytics/constants';
import { removeNullValues } from 'shared/relay/removeNullValues';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import { CommunityGalleryListItemFragment$key } from '~/generated/CommunityGalleryListItemFragment.graphql';
import { CommunityGalleryListItemQueryFragment$key } from '~/generated/CommunityGalleryListItemQueryFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import { EditPencilIcon } from '~/icons/EditPencilIcon';

import GalleryLink from '../core/GalleryLink/GalleryLink';
import IconContainer from '../core/IconContainer';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';
import { TokenPreview, TokenPreviewContainer } from '../Explore/ExploreUserCard';
import { ProfilePicture } from '../ProfilePicture/ProfilePicture';
import Shimmer from '../Shimmer/Shimmer';

type Props = {
  communityGalleryRef: CommunityGalleryListItemFragment$key;
  queryRef: CommunityGalleryListItemQueryFragment$key;
};

export function CommunityGalleryListItem({ communityGalleryRef, queryRef }: Props) {
  const communityGallery = useFragment(
    graphql`
      fragment CommunityGalleryListItemFragment on CommunityGallery {
        __typename
        gallery {
          dbid
          name
          owner {
            dbid
            username
            ...ProfilePictureFragment
          }
        }
        tokenPreviews {
          large
        }
      }
    `,
    communityGalleryRef
  );

  const query = useFragment(
    graphql`
      fragment CommunityGalleryListItemQueryFragment on Query {
        viewer {
          ... on Viewer {
            user {
              dbid
            }
          }
        }
      }
    `,
    queryRef
  );

  const { gallery } = communityGallery || {};

  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobileWindowWidth();

  const isOwnerGallery = useMemo(() => {
    return gallery?.owner?.dbid === query?.viewer?.user?.dbid;
  }, [gallery?.owner?.dbid, query?.viewer?.user?.dbid]);

  const selectedTokenUrls = useRef<string[]>([]);

  const nonNullTokenPreviews = useMemo(() => {
    const tokens = communityGallery?.tokenPreviews?.map((preview) => preview?.large);
    const nonEmptyTokens = tokens?.filter((token) => token !== '');
    // Remove duplicates
    const uniqueTokens = Array.from(new Set(removeNullValues(nonEmptyTokens)));
    return uniqueTokens;
  }, [communityGallery?.tokenPreviews]);

  const tokenPreviews = useMemo(() => {
    if (isHovered && nonNullTokenPreviews.length > 3) {
      // Filter out the previews that are already being shown
      const filteredPreviews = nonNullTokenPreviews.filter(
        (preview) => !selectedTokenUrls.current.includes(preview)
      );

      if (filteredPreviews.length >= 2) {
        const randomIndex = Math.floor(Math.random() * filteredPreviews.length);

        // If there are no more previews to show, just show the first two
        const firstPreview = filteredPreviews[randomIndex];
        const secondPreview = filteredPreviews[randomIndex + 1];

        const previews = [firstPreview, secondPreview].filter(Boolean) as string[];
        selectedTokenUrls.current = previews;

        return previews;
      }

      return selectedTokenUrls.current;
    }

    selectedTokenUrls.current = nonNullTokenPreviews.slice(0, 2);
    return nonNullTokenPreviews.slice(0, 2);
  }, [isHovered, nonNullTokenPreviews]);

  const router = useRouter();
  const handleEditGallery = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      const galleryId = gallery?.dbid;

      if (!galleryId) return;
      router.push({
        pathname: '/gallery/[galleryId]/edit',
        query: { galleryId },
      });
    },
    [gallery?.dbid, router]
  );

  return (
    <StyledCommunityGalleryListItem
      to={{
        pathname: '/[username]/galleries/[galleryId]',
        query: {
          username: communityGallery?.gallery?.owner?.username || '',
          galleryId: communityGallery?.gallery?.dbid || '',
        },
      }}
      eventElementId="Collection Page Gallery Tab Card"
      eventName="Collection Page Gallery Tab Card Click"
      eventContext={contexts.Community}
    >
      <StyledCommunityGalleryListItemContent
        gap={12}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <TokenPreviewContainer>
          {tokenPreviews.map((url, index) => (
            <ImageWithLoadingFallback url={url} key={index} />
          ))}
        </TokenPreviewContainer>
        <HStack align="center" justify="space-between">
          {isMobile ? (
            <VStack gap={4} grow>
              <HStack gap={4} align="center" justify="space-between">
                <HStack gap={4} align="center">
                  {communityGallery?.gallery?.owner && (
                    <ProfilePicture userRef={communityGallery?.gallery?.owner} size="xs" />
                  )}
                  <StyledUsername>{communityGallery?.gallery?.owner?.username}</StyledUsername>
                </HStack>
                {isOwnerGallery && (
                  <IconContainer
                    onClick={handleEditGallery}
                    size="sm"
                    variant="stacked"
                    icon={<EditPencilIcon />}
                  />
                )}
              </HStack>
              <BaseM>{communityGallery?.gallery?.name}</BaseM>
            </VStack>
          ) : (
            <>
              <HStack gap={4}>
                {communityGallery?.gallery?.owner && (
                  <ProfilePicture userRef={communityGallery?.gallery?.owner} size="md" />
                )}
                <VStack justify="center">
                  <StyledUsername>{communityGallery?.gallery?.owner?.username}</StyledUsername>
                  <BaseM>{communityGallery?.gallery?.name}</BaseM>
                </VStack>
              </HStack>

              {isOwnerGallery && (
                <IconContainer
                  onClick={handleEditGallery}
                  size="sm"
                  variant="stacked"
                  icon={<EditPencilIcon />}
                />
              )}
            </>
          )}
        </HStack>
      </StyledCommunityGalleryListItemContent>
    </StyledCommunityGalleryListItem>
  );
}

const StyledCommunityGalleryListItem = styled(GalleryLink)`
  border-radius: 4px;
  background-color: ${colors.offWhite};

  &:hover {
    background-color: ${colors.faint};
  }
`;

const StyledCommunityGalleryListItemContent = styled(VStack)`
  border-radius: 4px;
  padding: 12px;
`;

const StyledUsername = styled(BaseM)`
  font-weight: 700;
  line-height: 1.2;
`;

export function ImageWithLoadingFallback({ url }: { url: string }) {
  const [loading, setLoading] = useState(true);

  const handleLoad = useCallback(() => {
    setLoading(false);
  }, []);

  return (
    <>
      {loading && <Shimmer />}

      <TokenPreview
        src={url}
        onLoad={handleLoad}
        style={{
          display: loading ? 'none' : 'block',
        }}
      />
    </>
  );
}
