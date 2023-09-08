import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { CommunityHolderGridItemFragment$key } from '~/generated/CommunityHolderGridItemFragment.graphql';
import { CommunityHolderGridItemQueryFragment$key } from '~/generated/CommunityHolderGridItemQueryFragment.graphql';
import TokenDetailView from '~/scenes/TokenDetailPage/TokenDetailView';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';
import { getOpenseaExternalUrl } from '~/shared/utils/getOpenseaExternalUrl';
import { graphqlTruncateUniversalUsername } from '~/shared/utils/wallet';

import HoverCardOnUsername from '../HoverCard/HoverCardOnUsername';

type Props = {
  holderRef: CommunityHolderGridItemFragment$key;
  queryRef: CommunityHolderGridItemQueryFragment$key;
};

export default function CommunityHolderGridItem({ holderRef, queryRef }: Props) {
  const token = useFragment(
    graphql`
      fragment CommunityHolderGridItemFragment on Token {
        name
        tokenId
        chain
        contract {
          contractAddress {
            address
          }
        }
        owner @required(action: THROW) {
          username @required(action: THROW)
          universal
          ...walletTruncateUniversalUsernameFragment
          ...HoverCardOnUsernameFragment
        }
        ...useGetPreviewImagesSingleFragment
        ...TokenDetailViewFragment
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

  const { tokenId, contract, owner, chain } = token;

  const usernameWithFallback = owner ? graphqlTruncateUniversalUsername(owner) : null;

  const openseaProfileLink = `https://opensea.io/${owner?.username}`;

  // TODO:
  const imageUrl = useGetSinglePreviewImage({ tokenRef: token, size: 'large' }) ?? '';

  const openSeaExternalUrl = useMemo(() => {
    if (chain && contract?.contractAddress?.address && tokenId) {
      return getOpenseaExternalUrl(chain, contract.contractAddress.address, tokenId);
    }

    return '';
  }, [chain, contract?.contractAddress?.address, tokenId]);

  const handleClick = useCallback(() => {
    if (owner?.universal) {
      window.open(openSeaExternalUrl, '_blank');
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
  }, [openSeaExternalUrl, owner?.universal, query, showModal, token]);

  return (
    <VStack gap={8}>
      <StyledInteractiveLink onClick={handleClick}>
        <StyledNftImage src={imageUrl} />
      </StyledInteractiveLink>
      <VStack>
        <BaseM>{token?.name}</BaseM>
        {owner?.universal ? (
          <InteractiveLink href={openseaProfileLink}>{usernameWithFallback}</InteractiveLink>
        ) : (
          <HoverCardOnUsername userRef={token.owner}>
            <InteractiveLink to={{ pathname: '/[username]', query: { username: owner.username } }}>
              {usernameWithFallback}
            </InteractiveLink>
          </HoverCardOnUsername>
        )}
      </VStack>
    </VStack>
  );
}

const StyledNftImage = styled.img`
  height: auto;
  width: 100%;
  max-width: 100%;
  cursor: pointer;
`;

const StyledNftDetailViewPopover = styled(VStack)`
  height: 100%;
  padding: 80px 0;
  @media only screen and ${breakpoints.desktop} {
    padding: 0;
  }
`;

const StyledInteractiveLink = styled(InteractiveLink)`
  text-decoration: none;
`;
