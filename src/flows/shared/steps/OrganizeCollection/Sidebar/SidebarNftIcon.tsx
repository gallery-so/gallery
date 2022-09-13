import colors from 'components/core/colors';
import transitions from 'components/core/transitions';
import { SIDEBAR_ICON_DIMENSIONS } from 'constants/sidebar';
import { useCollectionEditorActions } from 'contexts/collectionEditor/CollectionEditorContext';
import { useReportError } from 'contexts/errorReporting/ErrorReportingContext';
import { memo, useCallback, useEffect, useRef } from 'react';
import { graphql, useFragment, useRelayEnvironment } from 'react-relay';
import styled from 'styled-components';
import getVideoOrImageUrlForNftPreview from 'utils/graphql/getVideoOrImageUrlForNftPreview';
import { getBackgroundColorOverrideForContract } from 'utils/token';
import { SidebarNftIconFragment$key } from '__generated__/SidebarNftIconFragment.graphql';
import { EditModeToken } from '../types';
import { NftFailureFallback } from 'components/NftFailureFallback/NftFailureFallback';
import { useNftRetry, useThrowOnMediaFailure } from 'hooks/useNftRetry';
import { SidebarNftIconPreviewAsset$key } from '../../../../../../__generated__/SidebarNftIconPreviewAsset.graphql';
import { ContentIsLoadedEvent } from 'contexts/shimmer/ShimmerContext';
import { NftFailureBoundary } from 'components/NftFailureFallback/NftFailureBoundary';
import { CouldNotRenderNftError } from 'errors/CouldNotRenderNftError';
import { fetchQuery } from 'relay-runtime';
import { SidebarNftIconPollerQuery } from '../../../../../../__generated__/SidebarNftIconPollerQuery.graphql';
import { BODY_FONT_FAMILY } from 'components/core/Text/Text';

type SidebarNftIconProps = {
  tokenRef: SidebarNftIconFragment$key;
  editModeToken: EditModeToken;
  handleTokenRenderError: (id: string) => void;
  handleTokenRenderSuccess: (id: string) => void;
};

function SidebarNftIcon({
  tokenRef,
  editModeToken,
  handleTokenRenderError,
  handleTokenRenderSuccess,
}: SidebarNftIconProps) {
  const token = useFragment(
    graphql`
      fragment SidebarNftIconFragment on Token {
        dbid
        contract {
          contractAddress {
            address
          }
        }
        media {
          ... on SyncingMedia {
            __typename
          }
        }
        ...SidebarNftIconPreviewAsset
      }
    `,
    tokenRef
  );

  const { isSelected, id } = editModeToken;

  const { setTokensIsSelected, stageTokens, unstageTokens } = useCollectionEditorActions();

  const mountRef = useRef(false);

  useEffect(() => {
    // When NFT is selected, scroll Staging Area to the added NFT.
    // But don't do this when this component is first mounted (we dont want to scroll to the bottom when we load the DnD)
    if (mountRef.current && isSelected) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }

    mountRef.current = true;
  }, [id, isSelected]);

  const contractAddress = token.contract?.contractAddress?.address ?? '';

  const backgroundColorOverride = getBackgroundColorOverrideForContract(contractAddress);

  const {
    isFailed,
    handleNftLoaded,
    handleNftError,
    retryKey,
    refreshMetadata,
    refreshingMetadata,
  } = useNftRetry({ tokenId: token.dbid });

  const handleClick = useCallback(() => {
    if (isFailed) {
      refreshMetadata();

      return;
    }

    setTokensIsSelected([id], !isSelected);
    if (isSelected) {
      unstageTokens([id]);
    } else {
      stageTokens([editModeToken]);
    }
  }, [
    isFailed,
    setTokensIsSelected,
    id,
    isSelected,
    refreshMetadata,
    unstageTokens,
    stageTokens,
    editModeToken,
  ]);

  const handleError = useCallback<ContentIsLoadedEvent>(
    (event) => {
      handleNftError(event);
      handleTokenRenderError(token.dbid);
    },
    [handleNftError, handleTokenRenderError, token.dbid]
  );

  const handleLoad = useCallback<ContentIsLoadedEvent>(
    (event) => {
      handleNftLoaded(event);
      handleTokenRenderSuccess(token.dbid);
    },
    [handleNftLoaded, handleTokenRenderSuccess, token.dbid]
  );

  const relayEnvironment = useRelayEnvironment();
  useEffect(
    function pollTokenWhileStillSyncing() {
      const POLLING_INTERVAL_MS = 5000;
      if (token.media?.__typename !== 'SyncingMedia') {
        return;
      }

      let timeoutId: ReturnType<typeof setTimeout>;

      async function refreshToken() {
        await fetchQuery<SidebarNftIconPollerQuery>(
          relayEnvironment,
          graphql`
            query SidebarNftIconPollerQuery($id: DBID!) {
              tokenById(id: $id) {
                ...SidebarNftIconFragment
              }
            }
          `,
          { id: token.dbid }
        ).toPromise();

        timeoutId = setTimeout(refreshToken, POLLING_INTERVAL_MS);
      }

      timeoutId = setTimeout(refreshToken, POLLING_INTERVAL_MS);

      return () => clearTimeout(timeoutId);
    },
    [relayEnvironment, token.dbid, token.media?.__typename]
  );

  if (token.media?.__typename === 'SyncingMedia') {
    return (
      <LoadingContainer>
        <LoadingText>Loading...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <NftFailureBoundary
      key={retryKey}
      fallback={
        <StyledSidebarNftIcon backgroundColorOverride={backgroundColorOverride}>
          <NftFailureFallback
            size="tiny"
            onRetry={refreshMetadata}
            refreshing={refreshingMetadata}
          />
        </StyledSidebarNftIcon>
      }
      onError={handleError}
    >
      <StyledSidebarNftIcon backgroundColorOverride={backgroundColorOverride}>
        <SidebarPreviewAsset
          tokenRef={token}
          onLoad={handleLoad}
          isSelected={isSelected ?? false}
        />
        <StyledOutline onClick={handleClick} isSelected={isSelected} />
      </StyledSidebarNftIcon>
    </NftFailureBoundary>
  );
}

const LoadingContainer = styled.div`
  width: ${SIDEBAR_ICON_DIMENSIONS}px;
  height: ${SIDEBAR_ICON_DIMENSIONS}px;

  display: flex;
  justify-content: center;
  align-items: center;

  background-color: ${colors.offWhite};
`;

const LoadingText = styled.span`
  font-family: ${BODY_FONT_FAMILY};
  font-style: normal;
  font-weight: 400;
  font-size: 10px;
  line-height: 12px;

  color: ${colors.metal};
`;

type SidebarPreviewAssetProps = {
  tokenRef: SidebarNftIconPreviewAsset$key;
  onLoad: ContentIsLoadedEvent;
  isSelected: boolean;
};

function SidebarPreviewAsset({ tokenRef, onLoad, isSelected }: SidebarPreviewAssetProps) {
  const token = useFragment(
    graphql`
      fragment SidebarNftIconPreviewAsset on Token {
        ...getVideoOrImageUrlForNftPreviewFragment
      }
    `,
    tokenRef
  );

  const reportError = useReportError();
  const previewUrlSet = getVideoOrImageUrlForNftPreview(token, reportError);

  if (!previewUrlSet?.urls.small) {
    throw new CouldNotRenderNftError('SidebarNftIcon', 'could not find small image url');
  }

  const { handleError } = useThrowOnMediaFailure('SidebarPreviewAsset');

  // Some OpenSea assets don't have an image url,
  // so render a freeze-frame of the video instead
  if (previewUrlSet?.type === 'video')
    return (
      <StyledVideo
        onLoadedData={onLoad}
        onError={handleError}
        isSelected={isSelected}
        src={previewUrlSet.urls.small}
      />
    );

  return (
    <StyledImage
      isSelected={isSelected}
      src={previewUrlSet.urls.small}
      alt="token"
      onLoad={onLoad}
      onError={handleError}
    />
  );
}

export const StyledSidebarNftIcon = styled.div<{ backgroundColorOverride: string }>`
  position: relative;
  width: ${SIDEBAR_ICON_DIMENSIONS}px;
  height: ${SIDEBAR_ICON_DIMENSIONS}px;
  
  // Important to show the refresh tooltip
  overflow: visible;

  display: flex;
  justify-content: center;
  align-items: center;
  ${({ backgroundColorOverride }) =>
    backgroundColorOverride && `background-color: ${backgroundColorOverride}`}};

  &:hover {
    cursor: pointer;
  }
`;

type SelectedProps = {
  isSelected?: boolean;
};

const StyledOutline = styled.div<SelectedProps>`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;

  border: ${({ isSelected }) => (isSelected ? 2 : 0)}px solid ${colors.activeBlue};

  user-select: none;
`;

const StyledImage = styled.img<SelectedProps>`
  max-height: 100%;
  max-width: 100%;
  transition: opacity ${transitions.cubic};
  opacity: ${({ isSelected }) => (isSelected ? 0.5 : 1)};
`;

const StyledVideo = styled.video<SelectedProps>`
  max-height: 100%;
  max-width: 100%;
  transition: opacity ${transitions.cubic};
  opacity: ${({ isSelected }) => (isSelected ? 0.5 : 1)};
`;

export default memo(SidebarNftIcon);
