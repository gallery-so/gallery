import breakpoints from 'components/core/breakpoints';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import { VStack } from 'components/core/Spacer/Stack';
import { BaseM } from 'components/core/Text/Text';
import NftPreviewAsset from 'components/NftPreview/NftPreviewAsset';
import { useModalActions } from 'contexts/modal/ModalContext';
import { useMemo, useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import TokenDetailView from 'scenes/TokenDetailPage/TokenDetailView';
import styled from 'styled-components';
import { getOpenseaExternalUrl } from 'utils/getOpenseaExternalUrl';
import noop from 'utils/noop';
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
        owner {
          username
          universal

          ...walletTruncateUniversalUsernameFragment
        }

        ...getVideoOrImageUrlForNftPreviewFragment
        ...TokenDetailViewFragment
        ...NftPreviewAssetFragment
      }
    `,
    holderRef
  );

  const { showModal } = useModalActions();

  const { tokenId, contract, owner } = token;

  const usernameWithFallback = owner ? graphqlTruncateUniversalUsername(owner) : null;

  const profileLink = owner?.universal
    ? `https://opensea.io/${owner?.username}`
    : `/${owner?.username}`;

  const openSeaExternalUrl = useMemo(() => {
    if (contract?.contractAddress?.address && tokenId) {
      return getOpenseaExternalUrl(contract.contractAddress.address, tokenId);
    }

    return '';
  }, [contract?.contractAddress?.address, tokenId]);

  const handleClick = useCallback(() => {
    if (owner?.universal) {
      window.open(openSeaExternalUrl, '_blank');
      return;
    }

    showModal({
      content: (
        <StyledNftDetailViewPopover justify="center">
          <TokenDetailView authenticatedUserOwnsAsset={false} queryRef={token} />
        </StyledNftDetailViewPopover>
      ),
      isFullPage: true,
    });
  }, [openSeaExternalUrl, owner?.universal, showModal, token]);

  return (
    <VStack gap={8}>
      <InteractiveLink onClick={handleClick}>
        <NftPreviewAsset tokenRef={token} size={240} onLoad={noop} />
      </InteractiveLink>
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

const StyledNftDetailViewPopover = styled(VStack)`
  height: 100%;
  padding: 80px 0;

  @media only screen and ${breakpoints.desktop} {
    padding: 0;
  }
`;
