import styled from 'styled-components';
import { Text } from 'components/core/Text/Text';
import colors from 'components/core/colors';

type Props = {
  handleSelectNft: (index: number, isSelected: boolean) => void;
  nftIndex: number;
  className?: string;
};
function UnstageButton({ handleSelectNft, nftIndex, className }: Props) {
  return (
    <StyledUnstageButton
      className={className}
      onClick={() => {
        handleSelectNft(nftIndex, false);
      }}
    >
      <Text color={colors.white}>DELETE</Text>
    </StyledUnstageButton>
  );
}

export const StyledUnstageButton = styled.button`
  position: absolute;
  top: 10px;
  right: 0;

  background: none;
  border: none;
  z-index: 10;
  cursor: pointer;
`;
export default UnstageButton;
