import colors from 'components/core/colors';
import styled from 'styled-components';
import { BodyRegular } from 'components/core/Text/Text';
import { Nft } from 'types/Nft';
import breakpoints from 'components/core/breakpoints';

type Props = {
  nft: Nft;
  className?: string;
};

function NftPreviewLabel({ nft, className }: Props) {
  return (
    <StyledNftPreviewLabel className={className}>
      <StyledBodyRegular color={colors.white} lines={1}>
        {nft.name}
      </StyledBodyRegular>
      <StyledBodyRegular color={colors.white} lines={2}>
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
  // height: 100%;
  // this helps position the label correctly in Safari
  // Safari differs from Chrome in how it renders height: 100% on position: absolute elements
  min-height: 56px;
`;

const StyledBodyRegular = styled(BodyRegular)<{ lines: number }>`
  word-wrap: break-word;
  word-break: break-all;

  margin: 0;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-clamp: ${({ lines }) => lines};
  -webkit-line-clamp: ${({ lines }) => lines};
  overflow: hidden;
  font-size: 12px;
  line-height: 16px;
  text-overflow: ellipsis;

  @media only screen and ${breakpoints.mobileLarge} {
    word-wrap: unset;
    word-break: unset;
  }

  @media only screen and ${breakpoints.tablet} {
    font-size: 14px;
    line-height: 20px;
    display: unset;
    -webkit-box-orient: unset;
    line-clamp: unset;
    -webkit-line-clamp: unset;
    overflow: visible;
    text-overflow: unset;
  }
}
`;

export default NftPreviewLabel;
