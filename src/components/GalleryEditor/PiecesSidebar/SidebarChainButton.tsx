import styled, { css } from 'styled-components';

import colors from '~/components/core/colors';
import { TitleXSBold } from '~/components/core/Text/Text';

type Props = {
  icon: string;
  title: string;
  isSelected: boolean;
  onClick: () => void;
};

export function SidebarChainButton({ isSelected, onClick, icon, title }: Props) {
  return (
    <ChainButton role="button" onClick={onClick} selected={isSelected}>
      <ChainLogo src={icon} />
      <TitleXSBold>{title}</TitleXSBold>
    </ChainButton>
  );
}
const ChainLogo = styled.img`
  width: 16px;
  height: 16px;

  margin-right: 4px;
`;

const ChainButton = styled.div<{ selected: boolean }>`
  display: flex;
  padding: 6px 10px;

  border: 1px solid ${colors.offBlack};
  border-radius: 24px;

  position: relative;
  align-items: center;
  cursor: pointer;

  ${({ selected }) =>
    selected
      ? css`
          opacity: 1;
        `
      : css`
          opacity: 0.5;
          border-color: ${colors.porcelain};
          filter: blur(0.05px);

          :hover {
            filter: none;
            opacity: 1;
          }
        `}
`;
