import { Nft } from 'types/Nft';
import useGet from '../_rest/useGet';

type Props = {
  address: string;
  skipCache?: boolean;
};

export type OpenseaSyncResponse = {
  nfts: Nft[];
};

export default function useOpenseaSync({ address, skipCache = false }: Props): Nft[] | undefined {
  const data = useGet<OpenseaSyncResponse>(
    `/nfts/opensea_get?address=${address}&skip_cache=${skipCache}`,
    'fetch and sync nfts',
  );

  return data?.nfts;
}
