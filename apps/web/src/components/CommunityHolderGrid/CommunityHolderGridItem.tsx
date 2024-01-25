import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { StyledImageWithLoading } from '~/components/LoadingAsset/ImageWithLoading';
import ShimmerProvider from '~/contexts/shimmer/ShimmerContext';
import { CommunityHolderGridItemFragment$key } from '~/generated/CommunityHolderGridItemFragment.graphql';
import { useContainedDimensionsForToken } from '~/hooks/useContainedDimensionsForToken';
import { StyledAnchorNftDetailModal } from '~/scenes/NftDetailPage/LinkToFullPageNftDetailModal';
import { StyledVideo } from '~/scenes/NftDetailPage/NftDetailVideo';
import { contexts } from '~/shared/analytics/constants';

import UserHoverCard from '../HoverCard/UserHoverCard';
import NftPreview from '../NftPreview/NftPreview';
import { ProfilePicture } from '../ProfilePicture/ProfilePicture';

type Props = {
  holderRef: CommunityHolderGridItemFragment$key;
};

const TOKEN_SIZE = 300;

export default function CommunityHolderGridItem({ holderRef }: Props) {
  const token = useFragment(
    graphql`
      fragment CommunityHolderGridItemFragment on Token {
        definition {
          name
          media @required(action: THROW) {
            ... on Media {
              ...useContainedDimensionsForTokenFragment
            }
          }
        }
        owner @required(action: THROW) {
          ...UserHoverCardFragment
          ...ProfilePictureFragment
        }
        ...NftPreviewFragment
      }
    `,
    holderRef
  );

  const { owner } = token;

  const resultDimensions = useContainedDimensionsForToken({
    mediaRef: token.definition.media,
    tokenSize: TOKEN_SIZE,
  });

  return (
    <VStack gap={8} justify="flex-end">
      <StyledNftPreviewWrapper resultHeight={resultDimensions.height}>
        <ShimmerProvider>
          <NftPreview tokenRef={token} eventContext={contexts.Community} />
        </ShimmerProvider>
      </StyledNftPreviewWrapper>
      <StyledItemTextWrapper>
        <StyledItemName>{token?.definition?.name} </StyledItemName>

        <HStack gap={4} align="center">
          <ProfilePicture userRef={owner} size="xxs" />
          <UserHoverCard userRef={token.owner} />
        </HStack>
      </StyledItemTextWrapper>
    </VStack>
  );
}

const StyledNftPreviewWrapper = styled.div<{ resultHeight: number }>`
  display: flex;
  height: 100%;
  width: 100%;
  flex: 1;

  ${StyledAnchorNftDetailModal} {
    align-items: flex-end;
    width: 100%;
  }

  ${StyledImageWithLoading}, ${StyledVideo} {
    align-items: flex-end;
    @media only screen and ${breakpoints.desktop} {
      width: 100%;
      height: auto;
    }
  }
`;

const StyledItemTextWrapper = styled(VStack)`
  height: 60px;
`;

const StyledItemName = styled(BaseM)`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;
