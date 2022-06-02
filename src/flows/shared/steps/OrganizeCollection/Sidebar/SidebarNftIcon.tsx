import colors from 'components/core/colors';
import transitions from 'components/core/transitions';
import { useCollectionEditorActions } from 'contexts/collectionEditor/CollectionEditorContext';
import { useReportError } from 'contexts/errorReporting/ErrorReportingContext';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import getVideoOrImageUrlForNftPreview from 'utils/graphql/getVideoOrImageUrlForNftPreview';
import { FALLBACK_URL, getBackgroundColorOverrideForContract } from 'utils/token';
import { SidebarNftIconFragment$key } from '__generated__/SidebarNftIconFragment.graphql';
import { EditModeToken } from '../types';

type SidebarNftIconProps = {
  tokenRef: SidebarNftIconFragment$key;
  EditModeToken: EditModeToken;
};

function SidebarNftIcon({ tokenRef, EditModeToken }: SidebarNftIconProps) {
  const token = useFragment(
    graphql`
      fragment SidebarNftIconFragment on Token {
        contractAddress @required(action: NONE) {
          address
        }
        ...getVideoOrImageUrlForNftPreviewFragment
      }
    `,
    tokenRef
  );

  if (!token) {
    throw new Error('SidebarNftIcon: token not provided');
  }

  const { isSelected, id } = EditModeToken;

  const { setTokensIsSelected, stageTokens, unstageTokens } = useCollectionEditorActions();

  const handleClick = useCallback(() => {
    setTokensIsSelected([id], !isSelected);
    if (isSelected) {
      unstageTokens([id]);
    } else {
      stageTokens([EditModeToken]);
    }
  }, [setTokensIsSelected, id, isSelected, unstageTokens, stageTokens, EditModeToken]);

  const mountRef = useRef(false);

  useEffect(() => {
    // When NFT is selected, scroll Staging Area to the added NFT.
    // But don't do this when this component is first mounted (we dont want to scroll to the bottom when we load the DnD)
    if (mountRef.current && isSelected) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }

    mountRef.current = true;
  }, [id, isSelected]);

  const reportError = useReportError();
  const result = getVideoOrImageUrlForNftPreview(token, reportError);

  if (!result || !result.urls.small) {
    reportError('Image URL not found for SidebarNftIcon');
  }

  const backgroundColorOverride = useMemo(
    () => getBackgroundColorOverrideForContract(token.contractAddress.address ?? ''),
    [token.contractAddress.address]
  );

  return (
    <StyledSidebarNftIcon backgroundColorOverride={backgroundColorOverride}>
      {
        // Some OpenSea assets dont have an image url, so render a freeze frame of the video instead
        result?.type === 'video' ? (
          <StyledVideo isSelected={isSelected} src={result?.urls.small ?? FALLBACK_URL} />
        ) : (
          <StyledImage
            isSelected={isSelected}
            src={result?.urls.small ?? FALLBACK_URL}
            alt="token"
          />
        )
      }
      <StyledOutline onClick={handleClick} isSelected={isSelected} />
    </StyledSidebarNftIcon>
  );
}

export const StyledSidebarNftIcon = styled.div<{ backgroundColorOverride: string }>`
  position: relative;
  width: 60px;
  height: 60px;
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
