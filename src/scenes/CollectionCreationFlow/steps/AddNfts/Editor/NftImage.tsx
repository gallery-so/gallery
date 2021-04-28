import styled from 'styled-components';
import { Nft } from 'types/Nft';

type Props = {
  nft?: Nft;
  isDragging?: boolean;
};

function NftImage({ nft, isDragging = false }: Props) {
  return (
    <StyledImage isDragging={isDragging} src={nft && nft.image_url} alt="" />
  );
}

const StyledImage = styled.img<{ isDragging: boolean }>`
  box-shadow: ${({ isDragging }) =>
    isDragging ? '0px 8px 15px 4px rgb(0 0 0 / 34%)' : 'none'};
`;

export default NftImage;
