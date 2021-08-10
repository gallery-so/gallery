import useSwr from 'swr/dist/use-swr';
import { Nft } from 'types/Nft';

type Props = {
  address: string;
};

type OpenseaSyncResponse = {
  nfts: Nft[];
};

export default function useOpenseaSync({ address }: Props) {
  const { data } = useSwr<OpenseaSyncResponse>(
    `/nfts/opensea_get?address=${address}`
  );

  return data;
}
