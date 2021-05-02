import colors from 'components/core/colors';
import styled from 'styled-components';
import { Nft } from 'types/Nft';
import { Text } from 'components/core/Text/Text';

type Props = {
  nft: Nft;
};

function NftPreviewLabel({ nft }: Props) {
  return (
    <StyledNftPreviewLabel>
      <StyledNftLabelText>{nft.name}</StyledNftLabelText>
      <StyledNftLabelText>Placehoder artist</StyledNftLabelText>
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
  padding: 24px 8px 8px;
  background-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0),
    rgba(0, 0, 0, 0.4) 30%,
    rgba(0, 0, 0, 0.7)
  );

  opacity: 0;
  z-index: 10;
  transition: opacity 200ms;
`;

const StyledNftLabelText = styled(Text)`
  margin: 0;
  color: ${colors.white};
`;
export default NftPreviewLabel;
