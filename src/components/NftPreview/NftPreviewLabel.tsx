import colors from 'components/core/colors';
import styled from 'styled-components';
import { BodyRegular } from 'components/core/Text/Text';
import { Nft } from 'types/Nft';

type Props = {
  nft: Nft;
  className?: string;
};

function NftPreviewLabel({ nft, className }: Props) {
  return (
    <StyledNftPreviewLabel className={className}>
      <StyledBodyRegular color={colors.white}>{nft.name}</StyledBodyRegular>
      <StyledBodyRegular color={colors.white}>
        {nft.token_collection_name}
      </StyledBodyRegular>
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
  justify-content: end;
  height: 100%;
  // this helps position the label correctly in Safari
  // Safari differs from Chrome in how it renders height: 100% on position: absolute elements
  min-height: 56px;
`;

const StyledBodyRegular = styled(BodyRegular)`
  margin: 0;
`;

export default NftPreviewLabel;
