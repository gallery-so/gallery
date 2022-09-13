import { TitleXSBold } from 'components/core/Text/Text';
import styled, { css } from 'styled-components';
import Tooltip from 'components/Tooltip/Tooltip';
import { Chain, chains } from 'flows/shared/steps/OrganizeCollection/Sidebar/chains';
import { useState } from 'react';

type Props = {
  icon: string;
  title: string;
  isSelected: boolean;
  onClick: () => void;
  locked: boolean;
};

export function SidebarChainButton({ isSelected, onClick, icon, title, locked }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <ChainButton
      role="button"
      locked={locked}
      onClick={onClick}
      selected={isSelected}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <ChainLogo src={icon} />
      <TitleXSBold>{title}</TitleXSBold>

      {locked && <LockedChainTooltip active={showTooltip} text="Coming soon..." />}
    </ChainButton>
  );
}

const LockedChainTooltip = styled(Tooltip)<{ active: boolean }>`
  bottom: 0;
  z-index: 10;
  opacity: ${({ active }) => (active ? 1 : 0)};
  transform: translateY(calc(100% + ${({ active }) => (active ? 4 : 0)}px));
`;

const ChainLogo = styled.img`
  width: 16px;
  height: 16px;

  margin-right: 4px;
`;

const ChainButton = styled.div<{ selected: boolean; locked: boolean }>`
  display: flex;

  position: relative;
  align-items: center;

  ${({ locked }) =>
    locked
      ? css`
          cursor: not-allowed;
        `
      : css`
          cursor: pointer;
        `}

  &:not(:last-child) {
    margin-right: 16px;
  }

  > *:not(${LockedChainTooltip}) {
    opacity: ${({ selected }) => (selected ? '1' : '.5')};
  }
`;
