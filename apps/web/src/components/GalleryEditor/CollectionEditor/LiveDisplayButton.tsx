import { useState } from 'react';
import styled from 'styled-components';

import Tooltip from '~/components/Tooltip/Tooltip';
import { useCollectionEditorContextNew } from '~/contexts/collectionEditor/CollectionEditorContextNew';
import VideoEnabledIcon from '~/icons/Video';
import VideoDisabledIcon from '~/icons/VideoDisabled';

type Props = {
  id: string;
};

export default function LiveDisplayButton({ id }: Props) {
  const { liveDisplayTokenIds, toggleTokenLiveDisplay } = useCollectionEditorContextNew();
  const isEnabled = liveDisplayTokenIds.has(id);

  const [showTooltip, setShowTooltip] = useState(false);

  return isEnabled ? (
    <>
      <StyledTooltip text="Turn off live display" showTooltip={showTooltip} />
      <StyledVideoEnabledIcon
        color="white"
        onClick={() => toggleTokenLiveDisplay(id)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      />
    </>
  ) : (
    <>
      <StyledTooltip text="Turn on live display" showTooltip={showTooltip} />
      <StyledVideoDisabledIcon
        color="white"
        onClick={() => toggleTokenLiveDisplay(id)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      />
    </>
  );
}

// use shared styles since wrapping each element in a styled div with these styles
// messed with the `mix-blend-mode` setting, which requires the Video Icons to be
// direct children of the parent SortableStagedNft component (see: SortableStagedNft.tsx)
const sharedStyles = `
  position: absolute;
  left: 8px;
  bottom: 8px;
  z-index: 11; // above the gradient
`;

const StyledTooltip = styled(Tooltip)<{ showTooltip: boolean }>`
  opacity: ${({ showTooltip }) => (showTooltip ? 1 : 0)};
  transform: translateY(${({ showTooltip }) => (showTooltip ? -22 : -18)}px);

  ${sharedStyles}
`;

export const StyledVideoEnabledIcon = styled(VideoEnabledIcon)`
  mix-blend-mode: exclusion;
  cursor: pointer;

  ${sharedStyles}
`;

export const StyledVideoDisabledIcon = styled(VideoDisabledIcon)`
  mix-blend-mode: exclusion;
  cursor: pointer;

  ${sharedStyles}
`;
