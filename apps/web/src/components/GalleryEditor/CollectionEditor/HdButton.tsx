import { useState } from 'react';
import styled from 'styled-components';

import Tooltip from '~/components/Tooltip/Tooltip';
import { useCollectionEditorContext } from '~/contexts/collectionEditor/CollectionEditorContext';
import HdDisabledIcon from '~/icons/HdDisabledIcon';
import HdEnabledIcon from '~/icons/HdIcon';

type Props = {
  id: string;
};

export default function HdButton({ id }: Props) {
  const { highDefinitionTokenIds, toggleTokenHighDefinition } = useCollectionEditorContext();
  const isEnabled = highDefinitionTokenIds.has(id);

  const [showTooltip, setShowTooltip] = useState(false);

  return isEnabled ? (
    <>
      <StyledTooltip text="Turn off hd view" showTooltip={showTooltip} />
      <StyledHdEnabledIcon
        color="white"
        onClick={() => toggleTokenHighDefinition(id)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      />
    </>
  ) : (
    <>
      <StyledTooltip text="Turn on hd view" showTooltip={showTooltip} />
      <StyledHdDisabledIcon
        color="white"
        onClick={() => toggleTokenHighDefinition(id)}
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
  top: 8px;
`;

const StyledTooltip = styled(Tooltip)<{ showTooltip: boolean }>`
  opacity: ${({ showTooltip }) => (showTooltip ? 1 : 0)};
  transform: translateY(${({ showTooltip }) => (showTooltip ? -22 : -18)}px);

  ${sharedStyles}
`;

export const StyledHdEnabledIcon = styled(HdEnabledIcon)`
  mix-blend-mode: exclusion;
  cursor: pointer;

  ${sharedStyles}
`;

export const StyledHdDisabledIcon = styled(HdDisabledIcon)`
  mix-blend-mode: exclusion;
  cursor: pointer;

  ${sharedStyles}
`;
