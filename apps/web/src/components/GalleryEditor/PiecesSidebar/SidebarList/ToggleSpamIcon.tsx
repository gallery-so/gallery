import { useState } from 'react';
import styled from 'styled-components';

import IconContainer from '~/components/core/IconContainer';
import Tooltip from '~/components/Tooltip/Tooltip';
import HideIcon from '~/icons/HideIcon';
import ShowIcon from '~/icons/ShowIcon';

import { TokenFilterType } from '../SidebarViewSelector';
import { CollectionTitleRow } from './SidebarList';

export type SetSpamFn = (address: string, isSpam: boolean) => void;

type Props = {
  row: CollectionTitleRow;
  selectedView: TokenFilterType;
  setSpamPreferenceForCollection: SetSpamFn;
};

export default function ToggleSpamIcon({
  row,
  selectedView,
  setSpamPreferenceForCollection,
}: Props) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
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
  );
}

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
