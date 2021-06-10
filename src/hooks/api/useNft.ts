import useSwr from 'swr';
import { isNftResponseError, Nft, NftResponse } from 'types/Nft';

type Props = {
  id: string;
};
export default function useNft({ id }: Props): Nft | null {
  const { data } = useSwr<NftResponse>(`/nfts/get?id=${id}`);

  if (!data || isNftResponseError(data)) {
    return null;
  }

  return data;
}
