import { Nft } from 'types/Nft';
import useGet from './rest/useGet';

type Props = {
  id: string;
};

export default function useNft({ id }: Props): Nft | undefined {
  const data = useGet<Nft>(`/nfts/get?id=${id}`, 'fetch nft');

  return data;
}
