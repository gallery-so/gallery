import colors from 'components/core/colors';
import styled from 'styled-components';
import { Nft } from 'types/Nft';
import { Text } from 'components/core/Text/Text';

type Props = {
  nft: Nft;
  className?: string;
};

function NftPreviewLabel({ nft, className }: Props) {
  return (
    <StyledNftPreviewLabel className={className}>
      <StyledNftLabelText>{nft.name}</StyledNftLabelText>
      <StyledNftLabelText>Placehodler artist</StyledNftLabelText>
    </StyledNftPreviewLabel>
  );
}

export const StyledNftPreviewLabel = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  bottom: 0;
  width: 100%;
  text-align: right;
  padding: 8px;
  z-index: 10;
`;

const StyledNftLabelText = styled(Text)`
  margin: 0;
  color: ${colors.white};
`;

export default NftPreviewLabel;
