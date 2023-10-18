import { useCallback, useState } from 'react';
import { useSyncCreatedTokensForExistingContract } from 'src/hooks/api/tokens/useSyncCreatedTokensForExistingContract';
import styled from 'styled-components';

import IconContainer from '~/components/core/IconContainer';
import Tooltip from '~/components/Tooltip/Tooltip';
import { RefreshIcon } from '~/icons/RefreshIcon';
import { useTrack } from '~/shared/contexts/AnalyticsContext';

type Props = {
  contractId: string;
};

export default function RefreshContractIcon({ contractId }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);

  const [syncCreatedTokensForExistingContract, isContractRefreshing] =
    useSyncCreatedTokensForExistingContract();

  console.log('contractId', contractId);

  const track = useTrack();
  const handleCreatorRefreshContract = useCallback(
    async (contractId: string) => {
      track('Editor Sidebar: Clicked Creator Contract Refresh');
      await syncCreatedTokensForExistingContract(contractId);
    },
    [track, syncCreatedTokensForExistingContract]
  );

  return (
    <>
      <ShowRefreshContainer
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={(e) => {
          e.stopPropagation();
          handleCreatorRefreshContract(contractId);
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
