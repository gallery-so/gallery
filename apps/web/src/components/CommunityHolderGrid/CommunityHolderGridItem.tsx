import { useCallback, useMemo, useState } from 'react';
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
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';
import colors from '~/shared/theme/colors';
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
        ...getVideoOrImageUrlForNftPreviewFragment
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

  const [isFailedToLoad, setIsFailedToLoad] = useState(false);
  const handleFailedToLoad = useCallback(() => {
    setIsFailedToLoad(true);
  }, []);

  const { showModal } = useModalActions();

  const { tokenId, contract, owner, chain } = token;

  const usernameWithFallback = owner ? graphqlTruncateUniversalUsername(owner) : null;

  const openseaProfileLink = `https://opensea.io/${owner?.username}`;

  const reportError = useReportError();
  const previewUrlSet = getVideoOrImageUrlForNftPreview({
    tokenRef: token,
    handleReportError: reportError,
  });

  if (!previewUrlSet?.urls.large) {
    throw new CouldNotRenderNftError('CommunityHolderGridItem', 'could not find large image url');
  }

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

  const previewAsset = useMemo(() => {
    if (isFailedToLoad || !previewUrlSet?.urls.large) {
      return (
        <StyledErrorWrapper justify="center" align="center">
          <StyledErrorText>Could not load</StyledErrorText>
        </StyledErrorWrapper>
      );
    }

    if (previewUrlSet?.type === 'video') {
      return <StyledNftVideo src={previewUrlSet.urls.large} onError={handleFailedToLoad} />;
    }

    return <StyledNftImage src={previewUrlSet.urls.large} onError={handleFailedToLoad} />;
  }, [handleFailedToLoad, isFailedToLoad, previewUrlSet?.type, previewUrlSet.urls.large]);

  return (
    <VStack gap={8}>
      <StyledInteractiveLink onClick={handleClick}>{previewAsset}</StyledInteractiveLink>
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

const StyledNftVideo = styled.video`
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

const StyledErrorWrapper = styled(VStack)`
  background-color: ${colors.offWhite};
  height: auto;
  width: 100%;
  aspect-ratio: 1 / 1;
`;

const StyledErrorText = styled(BaseM)`
  color: ${colors.metal};
`;
