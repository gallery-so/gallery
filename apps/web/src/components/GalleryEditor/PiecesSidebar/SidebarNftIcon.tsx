import { memo, useCallback, useEffect, useRef } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import transitions from '~/components/core/transitions';
import { NftFailureBoundary } from '~/components/NftFailureFallback/NftFailureBoundary';
import { SIDEBAR_ICON_DIMENSIONS } from '~/constants/sidebar';
import { useCollectionEditorContext } from '~/contexts/collectionEditor/CollectionEditorContext';
import { SidebarNftIconFragment$key } from '~/generated/SidebarNftIconFragment.graphql';
import { SidebarNftIconPreviewAssetNew$key } from '~/generated/SidebarNftIconPreviewAssetNew.graphql';
import { useNftRetry, useThrowOnMediaFailure } from '~/hooks/useNftRetry';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';
import colors from '~/shared/theme/colors';
import { getBackgroundColorOverrideForContract } from '~/utils/token';

type SidebarNftIconProps = {
  tokenRef: SidebarNftIconFragment$key;
};

function SidebarNftIcon({ tokenRef }: SidebarNftIconProps) {
  const token = useFragment(
    graphql`
      fragment SidebarNftIconFragment on Token {
        dbid
        contract {
          contractAddress {
            address
          }
        }
        ...SidebarNftIconPreviewAssetNew
      }
    `,
    tokenRef
  );

  const { stagedTokenIds, toggleTokenStaged } = useCollectionEditorContext();

  const isSelected = stagedTokenIds.has(token.dbid);

  const mountRef = useRef(false);

  useEffect(() => {
    // When NFT is selected, scroll Staging Area to the added NFT.
    // But don't do this when this component is first mounted (we dont want to scroll to the bottom when we load the DnD)
    if (mountRef.current && isSelected) {
      document.getElementById(token.dbid)?.scrollIntoView({ behavior: 'smooth' });
    }

    mountRef.current = true;
  }, [token.dbid, isSelected]);

  const contractAddress = token.contract?.contractAddress?.address ?? '';

  const backgroundColorOverride = getBackgroundColorOverrideForContract(contractAddress);

  const handleClick = useCallback(() => {
    toggleTokenStaged(token.dbid);
  }, [toggleTokenStaged, token.dbid]);

  return (
    <StyledSidebarNftIcon backgroundColorOverride={backgroundColorOverride}>
      <NftFailureBoundary tokenId={token.dbid} fallbackSize="tiny">
        <SidebarPreviewAsset tokenRef={token} isSelected={isSelected ?? false} />
        <StyledOutline onClick={handleClick} isSelected={isSelected} />
      </NftFailureBoundary>
    </StyledSidebarNftIcon>
  );
}

type SidebarPreviewAssetProps = {
  tokenRef: SidebarNftIconPreviewAssetNew$key;
  isSelected: boolean;
};

function SidebarPreviewAsset({ tokenRef, isSelected }: SidebarPreviewAssetProps) {
  const token = useFragment(
    graphql`
      fragment SidebarNftIconPreviewAssetNew on Token {
        dbid
        ...useGetPreviewImagesSingleFragment
      }
    `,
    tokenRef
  );

  const { handleNftLoaded } = useNftRetry({ tokenId: token.dbid });
  const { handleError } = useThrowOnMediaFailure('SidebarPreviewAsset');

  const imageUrl = useGetSinglePreviewImage({ tokenRef: token, size: 'small' }) ?? '';

  return (
    <StyledImage
      isSelected={isSelected}
      src={imageUrl}
      alt="token"
      onLoad={handleNftLoaded}
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

export default memo(SidebarNftIcon);
