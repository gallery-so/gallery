import colors from 'components/core/colors';
import transitions from 'components/core/transitions';
import { SIDEBAR_ICON_DIMENSIONS } from 'constants/sidebar';
import { useCollectionEditorActions } from 'contexts/collectionEditor/CollectionEditorContext';
import { useReportError } from 'contexts/errorReporting/ErrorReportingContext';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import getVideoOrImageUrlForNftPreview from 'utils/graphql/getVideoOrImageUrlForNftPreview';
import { getBackgroundColorOverrideForContract } from 'utils/token';
import { SidebarNftIconFragment$key } from '__generated__/SidebarNftIconFragment.graphql';
import { EditModeToken } from '../types';
import { NftFailureFallback } from 'components/NftPreview/NftFailureFallback';
import { useNftDisplayRetryLoader } from 'hooks/useNftDisplayRetryLoader';
import { SidebarNftIconPreviewAsset$key } from '../../../../../../__generated__/SidebarNftIconPreviewAsset.graphql';
import { ContentIsLoadedEvent } from 'contexts/shimmer/ShimmerContext';

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

  const backgroundColorOverride = useMemo(
    () => getBackgroundColorOverrideForContract(contractAddress),
    [contractAddress]
  );

  const {
    handleNftLoaded,
    handleNftError,
    isFailed,
    retryKey,
    refreshMetadata,
    refreshingMetadata,
  } = useNftDisplayRetryLoader({ tokenId: token.dbid });

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

  const handleError = useCallback(
    (event?: any) => {
      handleNftError(event);
      handleTokenRenderError(token.dbid);
    },
    [handleNftError, handleTokenRenderError, token.dbid]
  );

  const handleLoad = useCallback(
    (event?: any) => {
      handleNftLoaded(event);
      handleTokenRenderSuccess(token.dbid);
    },
    [handleNftLoaded, handleTokenRenderSuccess, token.dbid]
  );

  return (
    <StyledSidebarNftIcon key={retryKey} backgroundColorOverride={backgroundColorOverride}>
      {isFailed ? (
        <NftFailureFallback size="tiny" onClick={refreshMetadata} refreshing={refreshingMetadata} />
      ) : (
        <SidebarPreviewAsset
          tokenRef={token}
          onLoad={handleLoad}
          onError={handleError}
          isSelected={isSelected ?? false}
        />
      )}
      <StyledOutline onClick={handleClick} isSelected={isSelected} />
    </StyledSidebarNftIcon>
  );
}

type SidebarPreviewAssetProps = {
  tokenRef: SidebarNftIconPreviewAsset$key;
  onError: ContentIsLoadedEvent;
  onLoad: ContentIsLoadedEvent;
  isSelected: boolean;
};

function SidebarPreviewAsset({ tokenRef, onLoad, onError, isSelected }: SidebarPreviewAssetProps) {
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

  useEffect(() => {
    // THIS SHOULD BE THE SAME CONDITION AS THE ONE IN THE IF BELOW
    // We cannot extract a variable because TypeScript is unable
    // to recognize that the types get narrowed appropriately
    if (!previewUrlSet?.urls.small) {
      onError();
    }
  }, [onError, previewUrlSet?.urls.small]);

  // THIS ONE HERE
  if (previewUrlSet?.urls.small) {
    // Some OpenSea assets don't have an image url,
    // so render a freeze-frame of the video instead
    if (previewUrlSet?.type === 'video')
      return <StyledVideo onLoad={onLoad} isSelected={isSelected} src={previewUrlSet.urls.small} />;

    return (
      <StyledImage
        isSelected={isSelected}
        src={previewUrlSet.urls.small}
        alt="token"
        onLoad={onLoad}
        onError={onError}
      />
    );
  } else {
    return null;
  }
}

export const StyledSidebarNftIcon = styled.div<{ backgroundColorOverride: string }>`
  position: relative;
  width: ${SIDEBAR_ICON_DIMENSIONS}px;
  height: ${SIDEBAR_ICON_DIMENSIONS}px;
  overflow: hidden;

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
