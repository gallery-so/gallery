import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useState } from 'react';
import { graphql } from 'react-relay';
import { readInlineData } from 'relay-runtime';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import IconContainer from '~/components/core/IconContainer';
import { TitleXS } from '~/components/core/Text/Text';
import { ExpandedIcon } from '~/components/GalleryEditor/PiecesSidebar/ExpandedIcon';
import SidebarNftIcon from '~/components/GalleryEditor/PiecesSidebar/SidebarNftIcon';
import Tooltip from '~/components/Tooltip/Tooltip';
import VirtualizedContainer from '~/components/Virtualize/VirtualizeContainer';
import {
  SIDEBAR_COLLECTION_TITLE_BOTTOM_SPACE,
  SIDEBAR_COLLECTION_TITLE_HEIGHT,
  SIDEBAR_ICON_GAP,
} from '~/constants/sidebar';
import { SidebarListTokenFragment$key } from '~/generated/SidebarListTokenFragment.graphql';
import HideIcon from '~/icons/HideIcon';
import ShowIcon from '~/icons/ShowIcon';

import OnboardingDialog from '../GalleryOnboardingGuide/OnboardingDialog';
import { useOnboardingDialogContext } from '../GalleryOnboardingGuide/OnboardingDialogContext';
import { SidebarView } from './SidebarViewSelector';

export type CollectionTitleRow = {
  type: 'collection-title';
  expanded: boolean;
  address: string;
  title: string;
};

export type VirtualizedRow =
  | CollectionTitleRow
  | { type: 'tokens'; tokens: SidebarListTokenFragment$key[]; expanded: boolean };

type Props = {
  rows: VirtualizedRow[];
  selectedView: SidebarView;
  shouldUseCollectionGrouping: boolean;
  onToggleExpanded(address: string): void;
  handleTokenRenderError: (id: string) => void;
  handleTokenRenderSuccess: (id: string) => void;
  setSpamPreferenceForCollection: (address: string, isSpam: boolean) => void;
};

function CollectionTitle({
  row,
  key,
  index,
  style,
  selectedView,
  onToggleExpanded,
  setSpamPreferenceForCollection,
}: {
  row: CollectionTitleRow;
  key: string;
  index: number;
  style: React.CSSProperties;
  selectedView: SidebarView;
  onToggleExpanded: (address: string) => void;
  setSpamPreferenceForCollection: (address: string, isSpam: boolean) => void;
}) {
  const [showIcon, setShowIcon] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const { step, dialogMessage, nextStep, handleClose } = useOnboardingDialogContext();

  return (
    <CollectionTitleRow style={style}>
      <CollectionTitleContainer
        onClick={() => onToggleExpanded(row.address)}
        key={key}
        onMouseEnter={() => setShowIcon(true)}
        onMouseLeave={() => setShowIcon(false)}
      >
        <ExpandedIcon expanded={row.expanded} />
        <CollectionTitleText title={row.title}>{row.title}</CollectionTitleText>
        {showIcon && (
          <>
            <ShowHideContainer
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={(e) => {
                e.stopPropagation();
                setSpamPreferenceForCollection(row.address, selectedView === 'Collected');
              }}
            >
              <IconContainer
                variant="stacked"
                size="sm"
                icon={selectedView === 'Hidden' ? <ShowIcon /> : <HideIcon />}
              />
            </ShowHideContainer>
            <StyledTooltip
              text={selectedView === 'Hidden' ? 'Show' : 'Hide'}
              description={`This will move "${row.title}" to your ${
                selectedView === 'Hidden' ? 'Collected' : 'Hidden'
              } folder.`}
              whiteSpace="normal"
              visible={showTooltip}
            />
          </>
        )}
      </CollectionTitleContainer>

      {step === 4 && index === 0 && (
        <OnboardingDialog
          step={4}
          text={dialogMessage}
          onNext={nextStep}
          onClose={handleClose}
          options={{
            placement: 'left',
            positionOffset: 40,
            blinkingPosition: {
              top: 40,
              left: 7,
            },
          }}
        />
      )}
    </CollectionTitleRow>
  );
}

export function SidebarList({
  rows,
  selectedView,
  onToggleExpanded,
  handleTokenRenderError,
  handleTokenRenderSuccess,
  shouldUseCollectionGrouping,
  setSpamPreferenceForCollection,
}: Props) {
  const parentRef = useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 45,
    overscan: 5,
  });

  const items = virtualizer.getVirtualItems();

  return (
    <StyledListTokenContainer
      ref={parentRef}
      virtualizer={virtualizer}
      shouldUseCollectionGrouping={shouldUseCollectionGrouping}
    >
      {items.map((item) => {
        const { key, index } = item;
        const row = rows[index];

        if (!row) {
          return null;
        }

        if (row.type === 'collection-title') {
          return (
            <div data-index={item.index} ref={virtualizer.measureElement} key={item.key}>
              <CollectionTitle
                row={row}
                key={key as string}
                style={{}}
                index={index}
                selectedView={selectedView}
                onToggleExpanded={onToggleExpanded}
                setSpamPreferenceForCollection={setSpamPreferenceForCollection}
              />
            </div>
          );
        }

        if (row.type === 'tokens') {
          if (!row.expanded) {
            return null;
          }

          return (
            <div data-index={item.index} ref={virtualizer.measureElement} key={item.key}>
              <Selection key={key}>
                {row.tokens.map((tokenRef) => {
                  const token = readInlineData(
                    graphql`
                      fragment SidebarListTokenFragment on Token @inline {
                        dbid
                        ...SidebarNftIconFragment
                      }
                    `,
                    tokenRef
                  );

                  return (
                    <SidebarNftIcon
                      key={token.dbid}
                      tokenRef={token}
                      handleTokenRenderError={handleTokenRenderError}
                      handleTokenRenderSuccess={handleTokenRenderSuccess}
                    />
                  );
                })}
              </Selection>
            </div>
          );
        }
      })}
    </StyledListTokenContainer>
  );
}

const CollectionTitleText = styled(TitleXS)`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const CollectionTitleRow = styled.div`
  padding-bottom: ${SIDEBAR_COLLECTION_TITLE_BOTTOM_SPACE}px;

  position: relative;
`;

const CollectionTitleContainer = styled.div.attrs({ role: 'button' })`
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;

  height: ${SIDEBAR_COLLECTION_TITLE_HEIGHT}px;
  padding: 0 8px;

  border-radius: 2px;

  &:hover {
    background: ${colors.faint};
  }
`;

const StyledListTokenContainer = styled(VirtualizedContainer)<{
  shouldUseCollectionGrouping: boolean;
}>`
  flex-grow: 1;
  overflow-y: auto;

  // Need this since typically the CollectionTitle is responsible for the spacing between
  // the SidebarChainSelector and the SidebarList component
  margin-top: ${({ shouldUseCollectionGrouping }) => (shouldUseCollectionGrouping ? '0' : '12px')};
`;

const Selection = styled.div`
  padding: 0 12px;
  display: flex;
  grid-gap: ${SIDEBAR_ICON_GAP}px;
`;

const ShowHideContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
`;

const StyledTooltip = styled(Tooltip)<{ visible: boolean }>`
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  width: 130px;
  right: 0;
  top: 30px;
  z-index: 1;
`;
