import styled, { css } from 'styled-components';

import colors from '~/components/core/colors';
import { HStack } from '~/components/core/Spacer/Stack';
import { TitleXSBold } from '~/components/core/Text/Text';
import { ChainMetadata } from '~/components/GalleryEditor/PiecesSidebar/chains';

type Props = {
  chain: ChainMetadata;
  onClick: () => void;
  isSelected: boolean;
};

export function SidebarChainButton({ isSelected, onClick, chain }: Props) {
  return (
    <ChainButton layout role="button" onClick={onClick} selected={isSelected}>
      <HStack align="center">
        <ChainLogo src={chain.icon} />
        <TitleXSBold>{chain.shortName}</TitleXSBold>
      </HStack>
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
  gap: 0 8px;
  padding: 6px 8px;

  z-index: 1;

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
