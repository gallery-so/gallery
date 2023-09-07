import { useCallback, useEffect, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeL } from '~/components/core/Text/Text';
import {
  createVirtualizedRowsFromGroups,
  createVirtualizedRowsFromTokens,
} from '~/components/GalleryEditor/PiecesSidebar/createVirtualizedRowsFromGroups';
import { groupCollectionsByAddress } from '~/components/GalleryEditor/PiecesSidebar/groupCollectionsByAddress';
import { SidebarList } from '~/components/GalleryEditor/PiecesSidebar/SidebarList/SidebarList';
import { SidebarTokensFragment$key } from '~/generated/SidebarTokensFragment.graphql';
import useSetSpamPreference from '~/hooks/api/tokens/useSetSpamPreference';
import { Chain } from '~/shared/utils/chains';

import { TokenFilterType } from './SidebarViewSelector';

type SidebarTokensProps = {
  isSearching: boolean;
  selectedChain: Chain;
  selectedView: TokenFilterType;
  tokenRefs: SidebarTokensFragment$key;
};

export const SidebarTokens = ({
  tokenRefs,
  isSearching,
  selectedChain,
  selectedView,
}: SidebarTokensProps) => {
  const tokens = useFragment(
    graphql`
      fragment SidebarTokensFragment on Token @relay(plural: true) {
        id
        dbid

        # Escape hatch for data processing in util files
        # eslint-disable-next-line relay/unused-fields
        chain
        # Escape hatch for data processing in util files
        # eslint-disable-next-line relay/unused-fields
        isSpamByUser
        # Escape hatch for data processing in util files
        # eslint-disable-next-line relay/unused-fields
        isSpamByProvider

        contract {
          # Escape hatch for data processing in util files
          # eslint-disable-next-line relay/unused-fields
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
  const setSpamPreference = useSetSpamPreference();
  const setSpamPreferenceForCollection = useCallback(
    (address: string, isSpam: boolean) => {
      const filteredTokens = tokens
        .filter((token) => token.contract?.contractAddress?.address === address)
        .map(({ id, dbid }) => ({ id, dbid }));

      if (filteredTokens.length === 0) {
        throw new Error(
          `No matching token IDs found for ${address} to mark as ${isSpam ? 'spam' : 'not spam'}`
        );
      }

      setSpamPreference({ tokens: filteredTokens, isSpam });
    },
    [tokens, setSpamPreference]
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
      const groups = groupCollectionsByAddress({ tokens });

      return createVirtualizedRowsFromGroups({
        groups,
        erroredTokenIds,
        collapsedCollections,
      });
    } else {
      return createVirtualizedRowsFromTokens({
        tokens,
        erroredTokenIds,
      });
    }
  }, [collapsedCollections, erroredTokenIds, shouldUseCollectionGrouping, tokens]);

  useEffect(
    function resetCollapsedSectionsWhileSearching() {
      if (isSearching) {
        setCollapsedCollections(new Set());
      }
    },
    [isSearching]
  );

  useEffect(
    function collapseLargeSectionsByDefault() {
      const DEFAULT_COLLAPSE_TOKEN_COUNT = 24;

      const collapsed = new Set<string>();
      if (shouldUseCollectionGrouping) {
        const groups = groupCollectionsByAddress({ tokens });
        for (const group of groups) {
          if (group.tokens.length > DEFAULT_COLLAPSE_TOKEN_COUNT) {
            collapsed.add(group.address);
          }
        }
      }
      setCollapsedCollections(collapsed);
    },
    [shouldUseCollectionGrouping, tokens]
  );

  if (rows.length === 0) {
    return (
      <StyledVStack grow align="center" justify="center">
        <TitleDiatypeL>It&apos;s looking empty</TitleDiatypeL>
        <BaseM>No pieces matching your search query</BaseM>
      </StyledVStack>
    );
  }

  return (
    <SidebarList
      rows={rows}
      selectedView={selectedView}
      onToggleExpanded={handleToggleExpanded}
      handleTokenRenderError={handleMarkErroredTokenId}
      handleTokenRenderSuccess={handleMarkSuccessTokenId}
      shouldUseCollectionGrouping={shouldUseCollectionGrouping}
      setSpamPreferenceForCollection={setSpamPreferenceForCollection}
    />
  );
};

const StyledVStack = styled(VStack)`
  text-align: center;
`;
