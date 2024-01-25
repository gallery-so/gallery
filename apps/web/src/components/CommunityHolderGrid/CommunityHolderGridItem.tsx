import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { CommunityHolderGridItemFragment$key } from '~/generated/CommunityHolderGridItemFragment.graphql';
import { CommunityHolderGridItemQueryFragment$key } from '~/generated/CommunityHolderGridItemQueryFragment.graphql';
import TokenDetailView from '~/scenes/TokenDetailPage/TokenDetailView';
import { contexts } from '~/shared/analytics/constants';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';
import { extractRelevantMetadataFromToken } from '~/shared/utils/extractRelevantMetadataFromToken';

import UserHoverCard from '../HoverCard/UserHoverCard';
import { ProfilePicture } from '../ProfilePicture/ProfilePicture';

type Props = {
  holderRef: CommunityHolderGridItemFragment$key;
  queryRef: CommunityHolderGridItemQueryFragment$key;
};

export default function CommunityHolderGridItem({ holderRef, queryRef }: Props) {
  const token = useFragment(
    graphql`
      fragment CommunityHolderGridItemFragment on Token {
        definition {
          name
        }
        owner @required(action: THROW) {
          universal
          ...UserHoverCardFragment
          ...ProfilePictureFragment
        }
        ...useGetPreviewImagesSingleFragment
        ...TokenDetailViewFragment
        ...extractRelevantMetadataFromTokenFragment
      }
    `,
    holderRef
  );

  const query = useFragment(
    graphql`
      fragment CommunityHolderGridItemQueryFragment on Query {
        ...TokenDetailViewQueryFragment
      }
    `,
    queryRef
  );

  const { showModal } = useModalActions();

  const { owner } = token;

  // [GAL-4229] TODO: we'll need to wrap this component in a simple boundary
  // skipping for now since this component is rarely ever visited
  const imageUrl = useGetSinglePreviewImage({ tokenRef: token, size: 'large' }) ?? '';

  const { openseaUrl } = extractRelevantMetadataFromToken(token);

  const handleClick = useCallback(() => {
    if (owner?.universal) {
      window.open(openseaUrl, '_blank');
      return;
    }

    showModal({
      content: (
        <StyledNftDetailViewPopover justify="center" align="center">
          <TokenDetailView tokenRef={token} queryRef={query} />
        </StyledNftDetailViewPopover>
      ),
      isFullPage: true,
    });
  }, [openseaUrl, owner?.universal, query, showModal, token]);

  return (
    <VStack gap={8}>
      <StyledGalleryLink
        onClick={handleClick}
        eventElementId="Community Holder Grid Item"
        eventName="Click Community Holder Grid Item"
        eventContext={contexts['Community']}
      >
        <StyledNftImage src={imageUrl} />
      </StyledGalleryLink>
      <VStack>
        <BaseM>{token?.definition?.name}</BaseM>

        <HStack gap={4} align="center">
          <ProfilePicture userRef={owner} size="xxs" />
          <UserHoverCard userRef={token.owner} />
        </HStack>
      </VStack>
    </VStack>
  );
}

const StyledNftImage = styled.img`
  max-width: 100%;
  height: 240px;
  width: 240px;
  object-fit: contain;
  cursor: pointer;

  @media only screen and ${breakpoints.mobile} {
    height: auto;
    width: 100%;
  }
`;

const StyledNftDetailViewPopover = styled(VStack)`
  height: 100%;
  padding: 80px 0;
  @media only screen and ${breakpoints.desktop} {
    padding: 0;
  }
`;

const StyledGalleryLink = styled(GalleryLink)`
  text-decoration: none;
`;
