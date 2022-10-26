import breakpoints from 'components/core/breakpoints';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import { VStack } from 'components/core/Spacer/Stack';
import { BaseM } from 'components/core/Text/Text';
import { useReportError } from 'contexts/errorReporting/ErrorReportingContext';
import { useModalActions } from 'contexts/modal/ModalContext';
import { useMemo, useCallback, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import TokenDetailView from 'scenes/TokenDetailPage/TokenDetailView';
import styled from 'styled-components';
import { getOpenseaExternalUrl } from 'utils/getOpenseaExternalUrl';
import getVideoOrImageUrlForNftPreview from 'utils/graphql/getVideoOrImageUrlForNftPreview';
import { graphqlTruncateUniversalUsername } from 'utils/wallet';
import { CommunityHolderGridItemFragment$key } from '__generated__/CommunityHolderGridItemFragment.graphql';
import { CouldNotRenderNftError } from 'errors/CouldNotRenderNftError';
import colors from 'components/core/colors';

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
        collectorsNote
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
        ...TokenDetailViewFragment
        ...NftPreviewAssetFragment
      }
    `,
    holderRef
  );

  const [isFailedToLoad, setIsFailedToLoad] = useState(false);
  const handleFailedToLoad = useCallback(() => {
    setIsFailedToLoad(true);
  }, []);

  const { showModal } = useModalActions();

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
  height: 240px;
  aspect-ratio: 1;
`;

const StyledErrorText = styled(BaseM)`
  color: ${colors.metal};
`;
