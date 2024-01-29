import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import { contexts } from 'shared/analytics/constants';
import { removeNullValues } from 'shared/relay/removeNullValues';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import { CommunityGalleryListItemFragment$key } from '~/generated/CommunityGalleryListItemFragment.graphql';
import { CommunityGalleryListItemQueryFragment$key } from '~/generated/CommunityGalleryListItemQueryFragment.graphql';
import { EditPencilIcon } from '~/icons/EditPencilIcon';

import GalleryLink from '../core/GalleryLink/GalleryLink';
import IconContainer from '../core/IconContainer';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';
import { TokenPreview, TokenPreviewContainer } from '../Explore/ExploreUserCard';
import { ProfilePicture } from '../ProfilePicture/ProfilePicture';

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

  const isOwnerGallery = useMemo(() => {
    return gallery?.owner?.dbid === query?.viewer?.user?.dbid;
  }, [gallery?.owner?.dbid, query?.viewer?.user?.dbid]);

  const tokenPreviews = useMemo(() => {
    return removeNullValues(communityGallery?.tokenPreviews?.slice(0, 2));
  }, [communityGallery?.tokenPreviews]);

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
      eventElementId="Collection Gallery Card"
      eventName="Collection Gallery Card Click"
      eventContext={contexts.Community}
    >
      <TokenPreviewContainer>
        {tokenPreviews.map((url) => url?.large && <TokenPreview src={url.large} key={url.large} />)}
      </TokenPreviewContainer>
      <HStack align="center" justify="space-between">
        <HStack gap={4}>
          {communityGallery?.gallery?.owner && (
            <ProfilePicture userRef={communityGallery?.gallery?.owner} size="sm" />
          )}
          <VStack>
            <StyledUsername>{communityGallery?.gallery?.owner?.username}</StyledUsername>
            <BaseM>{communityGallery?.gallery?.name || 'Untitled'}</BaseM>
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
      </HStack>
    </StyledCommunityGalleryListItem>
  );
}

const StyledCommunityGalleryListItem = styled(GalleryLink)`
  padding: 12px;
  border-radius: 4px;
  background-color: ${colors.offWhite};
  display: flex;
  flex-direction: column;
  gap: 12px;

  &:hover {
    background-color: ${colors.faint};
  }
`;

const StyledUsername = styled(BaseM)`
  font-weight: 700;
  line-height: 1.2;
`;
