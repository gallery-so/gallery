import { Nft } from 'types/Nft';
import useGet from '../_rest/useGet';

type Props = {
  id: string;
};

type GetNftResponse = {
  nft: Nft;
};

const getNftsBaseUrl = '/nfts/get';
const getNftsAction = 'fetch nft';

function getNftsBaseUrlWithQuery({ id }: Props) {
  return `${getNftsBaseUrl}?id=${id}`;
}

export default function useNft({ id }: Props): Nft | undefined {
  const data = useGet<GetNftResponse>(getNftsBaseUrlWithQuery({ id }), getNftsAction);

  if (!data) {
    throw new Error(`No NFT was found with id: ${id}`);
  }

  return data.nft;
}
