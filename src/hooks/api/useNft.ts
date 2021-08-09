import useSwr from 'swr';
import { Nft } from 'types/Nft';

type Props = {
  id: string;
};

export default function useNft({ id }: Props): Nft | null {
  const { data } = useSwr<Nft>(`/nfts/get?id=${id}`);

  if (!data) {
    return null;
  }

  return data;
}
