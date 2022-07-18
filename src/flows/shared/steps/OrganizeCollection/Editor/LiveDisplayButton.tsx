import styled from 'styled-components';
import VideoEnabledIcon from 'src/icons/Video';
import VideoDisabledIcon from 'src/icons/VideoDisabled';
import {
  useCollectionEditorActions,
  useCollectionMetadataState,
} from 'contexts/collectionEditor/CollectionEditorContext';
import { useMemo, useState } from 'react';
import Tooltip from 'components/Tooltip/Tooltip';

type Props = {
  id: string;
};

export default function LiveDisplayButton({ id }: Props) {
  const collectionMetadata = useCollectionMetadataState();
  const { setTokenLiveDisplay } = useCollectionEditorActions();

  const isEnabled = useMemo(() => {
    return collectionMetadata.tokenSettings[id];
  }, [collectionMetadata.tokenSettings, id]);

  const [showTooltip, setShowTooltip] = useState(false);

  return isEnabled ? (
    <>
      <StyledTooltip text="Turn off live display" showTooltip={showTooltip} />
      <StyledVideoDisabledIcon
        color="white"
        onClick={() => setTokenLiveDisplay(id, false)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      />
    </>
  ) : (
    <>
      <StyledTooltip text="Turn on live display" showTooltip={showTooltip} />
      <StyledVideoEnabledIcon
        color="white"
        onClick={() => setTokenLiveDisplay(id, true)}
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
