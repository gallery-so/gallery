import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { TitleS, TitleXS } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import { FOOTER_HEIGHT } from 'flows/shared/components/WizardFooter/WizardFooter';
import TextButton from 'components/core/Button/TextButton';
import {
  useCollectionEditorActions,
  SidebarTokensState,
} from 'contexts/collectionEditor/CollectionEditorContext';
import { convertObjectToArray } from '../convertObjectToArray';
import SidebarNftIcon from './SidebarNftIcon';
import SearchBar from './SearchBar';
import { useWizardState } from 'contexts/wizard/WizardDataProvider';
import colors from 'components/core/colors';
import { generate12DigitId } from 'utils/collectionLayout';
import { graphql, useFragment } from 'react-relay';
import { SidebarFragment$key } from '__generated__/SidebarFragment.graphql';
import arrayToObjectKeyedById from 'utils/arrayToObjectKeyedById';
import { removeNullValues } from 'utils/removeNullValues';
import useIs3ac from 'hooks/oneOffs/useIs3ac';
import { SidebarViewerFragment$key } from '__generated__/SidebarViewerFragment.graphql';
import { useReportError } from 'contexts/errorReporting/ErrorReportingContext';
import getVideoOrImageUrlForNftPreview, {
  getVideoOrImageUrlForNftPreviewResult,
} from 'utils/graphql/getVideoOrImageUrlForNftPreview';
import { EditModeToken } from '../types';
import { AutoSizer, List, ListRowProps } from 'react-virtualized';

type Props = {
  sidebarTokens: SidebarTokensState;
  tokensRef: SidebarFragment$key;
  viewerRef: SidebarViewerFragment$key;
};

function Sidebar({ tokensRef, sidebarTokens, viewerRef }: Props) {
  const allTokens = useFragment(
    graphql`
      fragment SidebarFragment on Token @relay(plural: true) {
        dbid
        ...SidebarNftIconFragment
        ...SearchBarFragment
        ...getVideoOrImageUrlForNftPreviewFragment
      }
    `,
    tokensRef
  );

  const viewer = useFragment(
    graphql`
      fragment SidebarViewerFragment on Viewer {
        user {
          dbid
        }
      }
    `,
    viewerRef
  );

  const is3ac = useIs3ac(viewer.user?.dbid);

  const tokens = removeNullValues(allTokens);

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);

  const sidebarTokensAsArray = useMemo(() => convertObjectToArray(sidebarTokens), [sidebarTokens]);

  const tokensFilteredBySearch = useMemo(() => {
    if (debouncedSearchQuery) {
      const searchResultNfts = [];
      for (const resultId of searchResults) {
        if (sidebarTokens[resultId]) {
          searchResultNfts.push(sidebarTokens[resultId]);
        }
      }

      return searchResultNfts;
    }

    return sidebarTokensAsArray;
  }, [debouncedSearchQuery, searchResults, sidebarTokens, sidebarTokensAsArray]);

  const nftFragmentsKeyedByID = useMemo(() => arrayToObjectKeyedById('dbid', tokens), [tokens]);

  const nonNullTokens = useMemo(() => {
    return tokensFilteredBySearch.filter((editModeToken) =>
      Boolean(nftFragmentsKeyedByID[editModeToken.id])
    );
  }, [nftFragmentsKeyedByID, tokensFilteredBySearch]);

  const { isRefreshingNfts, handleRefreshNfts } = useWizardState();

  return (
    <StyledSidebar>
      <StyledSidebarContainer>
        <Header>
          <TitleS>All pieces</TitleS>
          {
            // prevent accidental refreshing for profiles we want to keep in tact
            is3ac ? null : (
              <StyledRefreshButton
                text={isRefreshingNfts ? 'Refreshing...' : 'Refresh wallet'}
                onClick={handleRefreshNfts}
                disabled={isRefreshingNfts}
              />
            )
          }
        </Header>
        <SearchBar
          tokensRef={tokens}
          setSearchResults={setSearchResults}
          setDebouncedSearchQuery={setDebouncedSearchQuery}
        />
      </StyledSidebarContainer>
      <Spacer height={16} />
      <SidebarTokens nftFragmentsKeyedByID={nftFragmentsKeyedByID} tokens={nonNullTokens} />
      <Spacer height={12} />
    </StyledSidebar>
  );
}

type SidebarTokensProps = {
  nftFragmentsKeyedByID: any;
  tokens: EditModeToken[];
};

type SidebarTokenPayload = {
  token: EditModeToken;
  previewUrlSet: getVideoOrImageUrlForNftPreviewResult;
};

/**
 * The purpose of this component is to front-load the sidebar with valid NFTs, and place invalid ones at the bottom.
 * We have a two-step mechanism for detecting invalid NFTs:
 * 1) first check if the NFT has a thumbnail-sized preview image. if not, it's considered invalid
 * 2) try to actually load the preview image manually. if it fails, it means the URL is corrupt
 *
 * The child <SidebarNftIcon /> will use this info to render the appropriate thumbnail
 */
const SidebarTokens = ({ nftFragmentsKeyedByID, tokens }: SidebarTokensProps) => {
  const COLUMN_COUNT = 3;
  const [displayedTokens, setDisplayedTokens] = useState<SidebarTokenPayload[]>([]);
  const reportError = useReportError();
  const { stageTokens } = useCollectionEditorActions();

  const handleAddBlankBlockClick = useCallback(() => {
    const id = `blank-${generate12DigitId()}`;
    stageTokens([{ id, whitespace: 'whitespace' }]);
    // auto scroll so that the new block is visible. 100ms timeout to account for async nature of staging tokens
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [stageTokens]);

  useEffect(() => {
    async function mount() {
      const tokensWithImagePreview: SidebarTokenPayload[] = [];
      const tokensWithoutImagePreview: SidebarTokenPayload[] = [];

      for (const token of tokens) {
        const previewUrlSet = getVideoOrImageUrlForNftPreview(
          nftFragmentsKeyedByID[token.id],
          reportError
        );
        if (!previewUrlSet || !previewUrlSet?.success || !previewUrlSet.urls.small) {
          // Image URL not found for SidebarNftIcon
          tokensWithoutImagePreview.push({ token, previewUrlSet });
        } else {
          // Actually try to load the image URL to see if it's valid
          await new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
              tokensWithImagePreview.push({ token, previewUrlSet });
              resolve();
            };
            img.onerror = () => {
              tokensWithoutImagePreview.push({
                token,
                previewUrlSet: { ...previewUrlSet, success: false },
              });
              resolve();
            };
            img.src = previewUrlSet.urls.small ?? '';
          });
        }
      }

      setDisplayedTokens([...tokensWithImagePreview, ...tokensWithoutImagePreview]);
    }

    mount();
  }, [nftFragmentsKeyedByID, reportError, tokens]);

  /**
   * We render a row with three token.
   */
  const rowRenderer = ({ key, style, index }: ListRowProps) => {
    const items = [];

    // add blank block button at the beginning of list
    if (index === 0) {
      items.push(
        <StyledAddBlankBlock onClick={handleAddBlankBlockClick}>
          <StyledAddBlankBlockText>Add Blank Space</StyledAddBlankBlockText>
        </StyledAddBlankBlock>
      );
    }

    const fromIndex = index === 0 ? 0 : index * COLUMN_COUNT - 1;

    // If first row, get two tokens (since we already have the add blank block button)
    // If second row onwards, get three tokens
    const lastAddedTokenIndex = fromIndex + (index === 0 ? COLUMN_COUNT - 1 : COLUMN_COUNT);

    const toIndex = Math.min(lastAddedTokenIndex, displayedTokens.length);

    for (let i = fromIndex; i < toIndex; i++) {
      const editModeToken = displayedTokens[i];
      items.push(
        <SidebarNftIcon
          key={editModeToken.token.id}
          tokenRef={nftFragmentsKeyedByID[editModeToken.token.id]}
          editModeToken={editModeToken.token}
          previewUrlSet={editModeToken.previewUrlSet}
        />
      );
    }

    return (
      <Selection key={key} style={style}>
        {items}
      </Selection>
    );
  };

  return (
    <StyledListTokenContainer>
      <AutoSizer>
        {({ width, height }) => (
          <List
            rowRenderer={rowRenderer}
            rowCount={Math.ceil(displayedTokens.length / COLUMN_COUNT)}
            rowHeight={60 + 19} // height of SidebarNftIcon 60 + gap
            width={width}
            height={height}
          />
        )}
      </AutoSizer>
    </StyledListTokenContainer>
  );
};

const StyledAddBlankBlock = styled.div`
  height: 60px;
  width: 60px;
  background-color: ${colors.offWhite};
  border: 1px solid ${colors.metal};
  text-transform: uppercase;
  display: flex;
  align-items: center;
  user-select: none;

  &:hover {
    cursor: pointer;
  }

  &:active {
    background-color: ${colors.metal};
  }
`;

const StyledAddBlankBlockText = styled(TitleXS)`
  color: ${colors.shadow};
  text-align: center;
`;

const StyledListTokenContainer = styled.div`
  width: 100%;
  height: calc(100% - ${FOOTER_HEIGHT}px);
`;

const StyledSidebar = styled.div`
  height: calc(100vh - ${FOOTER_HEIGHT}px);
  border-right: 1px solid ${colors.porcelain};
  user-select: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const StyledSidebarContainer = styled.div`
  padding: 16px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  min-height: 52px;
  padding-bottom: 16px;
`;

const Selection = styled.div`
  display: flex;
  grid-gap: 19px;
  padding-left: 16px;
`;

// This has the styling from InteractiveLink but we cannot use InteractiveLink because it is a TextButton
const StyledRefreshButton = styled(TextButton)`
  & p {
    font-size: 14px;
    line-height: 18px;
    text-transform: none;
    text-decoration: underline;
  }
`;

export default memo(Sidebar);
