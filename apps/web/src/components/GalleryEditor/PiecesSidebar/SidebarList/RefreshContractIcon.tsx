import { useCallback, useState } from 'react';
import styled from 'styled-components';

import Tooltip from '~/components/Tooltip/Tooltip';
import IconContainer from '~/components/core/IconContainer';
import { RefreshIcon } from '~/icons/RefreshIcon';
import { useRefreshContract } from '~/hooks/api/tokens/useRefreshContract';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { CollectionTitleRow } from './SidebarList';

type Props = {
  row: CollectionTitleRow;
};

export default function RefreshContractIcon({ row }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);

  const [refreshContract, isContractRefreshing] = useRefreshContract();

  const track = useTrack();
  const handleCreatorRefreshContract = useCallback(
    async (contractId: string) => {
      track('Editor Sidebar: Clicked Creator Contract Refresh');
      await refreshContract(contractId);
    },
    [track, refreshContract]
  );

  return (
    <>
      <ShowRefreshContainer
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={(e) => {
          e.stopPropagation();
          console.log('row.address', row.address);
          handleCreatorRefreshContract(row.address);
        }}
      >
        <IconContainer
          disabled={isContractRefreshing}
          variant="stacked"
          size="sm"
          icon={<RefreshIcon />}
        />
        <StyledTooltip text="Refresh Collection" whiteSpace="normal" visible={showTooltip} />
      </ShowRefreshContainer>
    </>
  );
}

const ShowRefreshContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
`;

const StyledTooltip = styled(Tooltip)<{ visible: boolean }>`
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  width: 110px;
  right: 0;
  top: 30px;
  z-index: 1;
`;
