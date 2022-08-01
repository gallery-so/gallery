import { memo, useCallback, useMemo, useState } from 'react';
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
import { EditModeToken } from '../types';
import { AutoSizer, List, ListRowProps } from 'react-virtualized';
import { COLUMN_COUNT, SIDEBAR_ICON_DIMENSIONS, SIDEBAR_ICON_GAP } from 'constants/sidebar';

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
      <SidebarTokens nftFragmentsKeyedByID={nftFragmentsKeyedByID} tokens={nonNullTokens} />
      <Spacer height={12} />
    </StyledSidebar>
  );
}

type SidebarTokensProps = {
  nftFragmentsKeyedByID: any;
  tokens: EditModeToken[];
};

const SidebarTokens = ({ nftFragmentsKeyedByID, tokens }: SidebarTokensProps) => {
  const [erroredTokenIds, setErroredTokenIds] = useState(new Set());
  const handleMarkErroredTokenId = useCallback((id) => {
    setErroredTokenIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const displayedTokens = useMemo(() => {
    const validTokens = [];
    const unsupportedTokens = [];

    for (const token of tokens) {
      if (erroredTokenIds.has(token.token.dbid)) {
        unsupportedTokens.push(token);
        continue;
      }
      validTokens.push(token);
    }

    return [...validTokens, ...unsupportedTokens];
  }, [erroredTokenIds, tokens]);

  type TokenOrWhitespace = EditModeToken | 'whitespace';

  const rows = useMemo(() => {
    const rows: TokenOrWhitespace[][] = [];

    let row: TokenOrWhitespace[] = ['whitespace'];

    displayedTokens.forEach((token) => {
      row.push(token);

      // if the row is full, push it to the rows array
      if (row.length % COLUMN_COUNT === 0) {
        rows.push(row);
        row = [];
      }
    });
    return rows;
  }, [displayedTokens]);

  /**
   * We render a row with three token.
   */
  const { stageTokens } = useCollectionEditorActions();

  const handleAddBlankBlockClick = useCallback(() => {
    const id = `blank-${generate12DigitId()}`;
    stageTokens([{ id, whitespace: 'whitespace' }]);
    // auto scroll so that the new block is visible. 100ms timeout to account for async nature of staging tokens
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [stageTokens]);

  const rowRenderer = ({ key, style, index }: ListRowProps) => {
    const row = rows[index];
    return (
      <Selection key={key} style={style}>
        {row.map((tokenOrWhitespace) => {
          if (tokenOrWhitespace === 'whitespace') {
            return (
              <StyledAddBlankBlock onClick={handleAddBlankBlockClick}>
                <StyledAddBlankBlockText>Add Blank Space</StyledAddBlankBlockText>
              </StyledAddBlankBlock>
            );
          }
          return (
            <SidebarNftIcon
              key={tokenOrWhitespace.token.dbid}
              tokenRef={nftFragmentsKeyedByID[tokenOrWhitespace.token.dbid]}
              editModeToken={tokenOrWhitespace}
              handleTokenRenderError={handleMarkErroredTokenId}
              // this is determined at the parent level so the child doesn't need to re-compute it
              // when it scrolls back into view
              hasErrored={erroredTokenIds.has(tokenOrWhitespace.token.dbid)}
            />
          );
        })}
      </Selection>
    );
  };

  const rowHeight = SIDEBAR_ICON_DIMENSIONS + SIDEBAR_ICON_GAP;

  return (
    <StyledListTokenContainer>
      <AutoSizer>
        {({ width, height }) => (
          <List
            rowRenderer={rowRenderer}
            rowCount={Math.ceil(displayedTokens.length / COLUMN_COUNT)}
            rowHeight={rowHeight}
            width={width}
            height={height}
          />
        )}
      </AutoSizer>
    </StyledListTokenContainer>
  );
};

const StyledAddBlankBlock = styled.div`
  height: ${SIDEBAR_ICON_DIMENSIONS}px;
  width: ${SIDEBAR_ICON_DIMENSIONS}px;
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
  grid-gap: ${SIDEBAR_ICON_GAP}px;
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
