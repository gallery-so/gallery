import { Nft } from 'types/Nft';
import useGet from './rest/useGet';

type Props = {
  address: string;
};

type OpenseaSyncResponse = {
  nfts: Nft[];
};

export default function useOpenseaSync({ address }: Props): Nft[] | undefined {
  const data = useGet<OpenseaSyncResponse>(
    `/nfts/opensea_get?address=${address}`,
    'fetch and sync nfts'
  );

  return data?.nfts;
}
