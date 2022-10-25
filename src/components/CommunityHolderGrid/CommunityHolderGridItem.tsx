import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import { VStack } from 'components/core/Spacer/Stack';
import { BaseM } from 'components/core/Text/Text';
import { CouldNotRenderNftError } from 'errors/CouldNotRenderNftError';
import Link from 'next/link';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { getOpenseaExternalUrl } from 'utils/getOpenseaExternalUrl';
import { graphqlGetResizedNftImageUrlWithFallback } from 'utils/token';
import { CommunityHolderGridItemFragment$key } from '__generated__/CommunityHolderGridItemFragment.graphql';

type Props = {
  holderRef: CommunityHolderGridItemFragment$key;
};

export default function CommunityHolderGridItem({ holderRef }: Props) {
  const token = useFragment(
    graphql`
      fragment CommunityHolderGridItemFragment on Token {
        dbid
        name
        tokenId
        contract {
          contractAddress {
            address
          }
        }
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
          universal
        }
      }
    `,
    holderRef
  );
  const { tokenId, contract, owner } = token;

  const galleryLink = `/${owner?.username}`;

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
  const openSeaExternalUrl = useMemo(() => {
    if (contract?.contractAddress?.address && tokenId) {
      return getOpenseaExternalUrl(contract.contractAddress.address, tokenId);
    }

    return null;
  }, [contract?.contractAddress?.address, tokenId]);

  return (
    <VStack gap={8}>
      <Link href={openSeaExternalUrl || ''} passHref>
        <a target="_blank">
          <StyledNftImage src={src} />
        </a>
      </Link>
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
  cursor: pointer;
`;
