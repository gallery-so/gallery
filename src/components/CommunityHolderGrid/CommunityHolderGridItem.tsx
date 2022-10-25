import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import { VStack } from 'components/core/Spacer/Stack';
import { BaseM } from 'components/core/Text/Text';
import { useReportError } from 'contexts/errorReporting/ErrorReportingContext';
import { CouldNotRenderNftError } from 'errors/CouldNotRenderNftError';
import Link from 'next/link';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { getOpenseaExternalUrl } from 'utils/getOpenseaExternalUrl';
import getVideoOrImageUrlForNftPreview from 'utils/graphql/getVideoOrImageUrlForNftPreview';
import { graphqlTruncateUniversalUsername } from 'utils/wallet';
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

          ... on VideoMedia {
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

          ...walletTruncateUniversalUsernameFragment
        }

        ...getVideoOrImageUrlForNftPreviewFragment
      }
    `,
    holderRef
  );
  const { tokenId, contract, owner } = token;

  const usernameWithFallback = owner ? graphqlTruncateUniversalUsername(owner) : null;

  const profileLink = owner?.universal
    ? `https://opensea.io/${owner?.username}`
    : `/${owner?.username}`;

  const reportError = useReportError();
  const previewUrlSet = getVideoOrImageUrlForNftPreview(token, reportError);

  if (!previewUrlSet?.urls.large) {
    throw new CouldNotRenderNftError('CommunityHolderGridItem', 'could not find large image url');
  }

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
          {previewUrlSet?.type === 'video' ? (
            <StyledNftVideo src={previewUrlSet.urls.large} />
          ) : (
            <StyledNftImage src={previewUrlSet.urls.large} />
          )}
        </a>
      </Link>
      <VStack>
        <BaseM>{token?.name}</BaseM>
        {owner?.universal ? (
          <InteractiveLink href={profileLink}>{usernameWithFallback}</InteractiveLink>
        ) : (
          <InteractiveLink to={profileLink}>{usernameWithFallback}</InteractiveLink>
        )}
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

const StyledNftVideo = styled.video`
  min-height: 240px;
  width: auto;
  max-width: 100%;
  cursor: pointer;
`;
