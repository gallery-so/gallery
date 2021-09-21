import { Nft } from 'types/Nft';
import useGet from '../_rest/useGet';

type Props = {
  id: string;
};

type GetNftResponse = {
  nft: Nft;
};

export default function useNft({ id }: Props): Nft | undefined {
  const data = useGet<GetNftResponse>(`/nfts/get?id=${id}`, 'fetch nft');

  if (!data) {
    throw new Error(`No NFT was found with id: ${id}`);
  }

  return data.nft;
}
