import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import { VStack } from 'components/core/Spacer/Stack';
import { BaseM } from 'components/core/Text/Text';
import { CouldNotRenderNftError } from 'errors/CouldNotRenderNftError';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { graphqlGetResizedNftImageUrlWithFallback } from 'utils/token';
import { CommunityHolderGridItemFragment$key } from '__generated__/CommunityHolderGridItemFragment.graphql';

type Props = {
  holderRef: CommunityHolderGridItemFragment$key;
};

export default function CommunityHolderGridItem({ holderRef }: Props) {
  const token = useFragment(
    graphql`
      # TODO: @inline?
      fragment CommunityHolderGridItemFragment on Token {
        dbid
        name
        media {
          __typename

          ... on ImageMedia {
            previewURLs @required(action: NONE) {
              large @required(action: NONE)
            }
          }

          ... on UnknownMedia {
            previewURLs @required(action: NONE) {
              large @required(action: NONE)
            }
          }
        }
        owner {
          username
        }
      }
    `,
    holderRef
  );

  const galleryLink = `/${token?.owner?.username}`;

  const resizedNft =
    token.media && 'previewURLs' in token.media
      ? graphqlGetResizedNftImageUrlWithFallback(token.media.previewURLs.large, 480)
      : null;

  if (!resizedNft) {
    throw new CouldNotRenderNftError(
      'NftPreviewAsset',
      'could not compute graphqlGetResizedNftImageUrlWithFallback'
    );
  }

  const { url: src } = resizedNft;

  return (
    <VStack gap={8}>
      <StyledNftImage src={src} />
      <VStack>
        <BaseM>{token?.name}</BaseM>
        <InteractiveLink to={galleryLink}>{token?.owner?.username}</InteractiveLink>
      </VStack>
    </VStack>
  );
}

const StyledNftImage = styled.img`
  min-height: 240px;
  width: auto;
  max-width: 100%;
`;
