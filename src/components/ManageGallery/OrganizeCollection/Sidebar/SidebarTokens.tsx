import { EditModeToken } from 'components/ManageGallery/OrganizeCollection/types';
import { SidebarTokensFragment$key } from '../../../../../__generated__/SidebarTokensFragment.graphql';
import { graphql, useFragment } from 'react-relay';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { groupCollectionsByAddress } from 'components/ManageGallery/OrganizeCollection/Sidebar/groupCollectionsByAddress';
import {
  createVirtualizedRowsFromGroups,
  createVirtualizedRowsFromTokens,
} from 'components/ManageGallery/OrganizeCollection/Sidebar/createVirtualizedRowsFromGroups';
import { EmptySidebar } from 'components/ManageGallery/OrganizeCollection/Sidebar/EmptySidebar';
import { SidebarList } from 'components/ManageGallery/OrganizeCollection/Sidebar/SidebarList';
import { Chain } from 'components/ManageGallery/OrganizeCollection/Sidebar/chains';

type SidebarTokensProps = {
  isSearching: boolean;
  selectedChain: Chain;
  editModeTokens: EditModeToken[];
  tokenRefs: SidebarTokensFragment$key;
};

export const SidebarTokens = ({
  tokenRefs,
  isSearching,
  selectedChain,
  editModeTokens,
}: SidebarTokensProps) => {
  const tokens = useFragment(
    graphql`
      fragment SidebarTokensFragment on Token @relay(plural: true) {
        dbid

        chain

        contract {
          name
          contractAddress {
            address
          }
        }

        ...SidebarListTokenFragment
      }
    `,
    tokenRefs
  );

  const [erroredTokenIds, setErroredTokenIds] = useState<Set<string>>(new Set());
  const [collapsedCollections, setCollapsedCollections] = useState<Set<string>>(new Set());

  const handleMarkErroredTokenId = useCallback((id: string) => {
    setErroredTokenIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const handleMarkSuccessTokenId = useCallback((id: string) => {
    setErroredTokenIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handleToggleExpanded = useCallback((address: string) => {
    setCollapsedCollections((previous) => {
      const next = new Set(previous);

      if (next.has(address)) {
        next.delete(address);
      } else {
        next.add(address);
      }

      return next;
    });
  }, []);

  let shouldUseCollectionGrouping: boolean;
  if (isSearching) {
    shouldUseCollectionGrouping = true;
  } else {
    shouldUseCollectionGrouping = selectedChain !== 'POAP';
  }

  const rows = useMemo(() => {
    if (shouldUseCollectionGrouping) {
      const groups = groupCollectionsByAddress({ tokens, editModeTokens });

      return createVirtualizedRowsFromGroups({ groups, erroredTokenIds, collapsedCollections });
    } else {
      return createVirtualizedRowsFromTokens({ tokens, editModeTokens, erroredTokenIds });
    }
  }, [collapsedCollections, editModeTokens, erroredTokenIds, shouldUseCollectionGrouping, tokens]);

  useEffect(
    function resetCollapsedSectionsWhileSearching() {
      if (isSearching) {
        setCollapsedCollections(new Set());
      }
    },
    [isSearching]
  );

  if (rows.length === 0) {
    return (
      <EmptySidebar reason={isSearching ? 'no-search-results' : 'no-nfts'} chain={selectedChain} />
    );
  }

  return (
    <SidebarList
      rows={rows}
      onToggleExpanded={handleToggleExpanded}
      handleTokenRenderError={handleMarkErroredTokenId}
      handleTokenRenderSuccess={handleMarkSuccessTokenId}
      shouldUseCollectionGrouping={shouldUseCollectionGrouping}
    />
  );
};
