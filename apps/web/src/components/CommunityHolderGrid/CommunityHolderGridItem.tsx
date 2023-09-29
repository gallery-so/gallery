import { useCallback } from 'react';
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
import { extractRelevantMetadataFromToken } from '~/shared/utils/extractRelevantMetadataFromToken';
import { graphqlTruncateUniversalUsername } from '~/shared/utils/wallet';

import UserHoverCard from '../HoverCard/UserHoverCard';

type Props = {
  holderRef: CommunityHolderGridItemFragment$key;
  queryRef: CommunityHolderGridItemQueryFragment$key;
};

export default function CommunityHolderGridItem({ holderRef, queryRef }: Props) {
  const token = useFragment(
    graphql`
      fragment CommunityHolderGridItemFragment on Token {
        name
        owner @required(action: THROW) {
          username @required(action: THROW)
          universal
          ...walletTruncateUniversalUsernameFragment
          ...UserHoverCardFragment
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

  const usernameWithFallback = owner ? graphqlTruncateUniversalUsername(owner) : null;

  const openseaProfileLink = `https://opensea.io/${owner?.username}`;

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
      <StyledInteractiveLink onClick={handleClick}>
        <StyledNftImage src={imageUrl} />
      </StyledInteractiveLink>
      <VStack>
        <BaseM>{token?.name}</BaseM>
        {owner?.universal ? (
          <InteractiveLink href={openseaProfileLink}>{usernameWithFallback}</InteractiveLink>
        ) : (
          <UserHoverCard userRef={token.owner} />
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
