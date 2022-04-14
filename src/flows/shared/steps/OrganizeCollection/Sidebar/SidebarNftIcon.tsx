import colors from 'components/core/colors';
import transitions from 'components/core/transitions';
import { useCollectionEditorActions } from 'contexts/collectionEditor/CollectionEditorContext';
import { memo, useCallback, useEffect, useRef } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import getVideoOrImageUrlForNftPreview from 'utils/graphql/getVideoOrImageUrlForNftPreview';
import { SidebarNftIconFragment$key } from '__generated__/SidebarNftIconFragment.graphql';
import { EditModeNft } from '../types';

type SidebarNftIconProps = {
  nftRef: SidebarNftIconFragment$key;
  editModeNft: EditModeNft;
};

function SidebarNftIcon({ nftRef, editModeNft }: SidebarNftIconProps) {
  const nft = useFragment(
    graphql`
      fragment SidebarNftIconFragment on Nft {
        ...getVideoOrImageUrlForNftPreviewFragment
      }
    `,
    nftRef
  );

  const { isSelected, id } = editModeNft;

  const { setNftsIsSelected, stageNfts, unstageNfts } = useCollectionEditorActions();

  const handleClick = useCallback(() => {
    setNftsIsSelected([id], !isSelected);
    if (isSelected) {
      unstageNfts([id]);
    } else {
      stageNfts([editModeNft]);
    }
  }, [setNftsIsSelected, id, isSelected, unstageNfts, stageNfts, editModeNft]);

  const mountRef = useRef(false);

  useEffect(() => {
    // When NFT is selected, scroll Staging Area to the added NFT.
    // But don't do this when this component is first mounted (we dont want to scroll to the bottom when we load the DnD)
    if (mountRef.current && isSelected) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }

    mountRef.current = true;
  }, [id, isSelected]);

  const result = getVideoOrImageUrlForNftPreview(nft);

  if (!result || !result.urls.small) {
    throw new Error('Image URL not found for SidebarNftIcon');
  }

  return (
    <StyledSidebarNftIcon>
      {
        // Some OpenSea assets dont have an image url, so render a freeze frame of the video instead
        result.type === 'video' ? (
          <StyledVideo isSelected={isSelected} src={result.urls.small} />
        ) : (
          <StyledImage isSelected={isSelected} src={result.urls.small} alt="nft" />
        )
      }
      <StyledOutline onClick={handleClick} isSelected={isSelected} />
    </StyledSidebarNftIcon>
  );
}

export const StyledSidebarNftIcon = styled.div`
  position: relative;
  width: 64px;
  height: 64px;
  overflow: hidden;
  margin: 5px;

  display: flex;
  justify-content: center;
  align-items: center;

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

  border: ${({ isSelected }) => (isSelected ? 1 : 0)}px solid ${colors.activeBlue};
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
