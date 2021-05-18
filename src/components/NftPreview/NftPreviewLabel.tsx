import colors from 'components/core/colors';
import styled from 'styled-components';
import { Nft } from 'types/Nft';
import { BodyRegular } from 'components/core/Text/Text';

type Props = {
  nft: Nft;
  className?: string;
};

function NftPreviewLabel({ nft, className }: Props) {
  return (
    <StyledNftPreviewLabel className={className}>
      <StyledBodyRegular color={colors.white}>{nft.name}</StyledBodyRegular>
      <StyledBodyRegular color={colors.white}>{nft.artist}</StyledBodyRegular>
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

const StyledBodyRegular = styled(BodyRegular)`
  margin: 0;
`;

export default NftPreviewLabel;
