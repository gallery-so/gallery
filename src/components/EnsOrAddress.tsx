import useSWR from 'swr';

const fetcher = async (...args: Parameters<typeof fetch>) =>
  fetch(...args).then(async (res) => res.json());

type Props = {
  address: string;
};

export const EnsOrAddress = ({ address }: Props) => {
  const { data } = useSWR(
    `https://api.ensideas.com/ens/resolve/${encodeURIComponent(address)}`,
    fetcher
  );
  if (data) {
    return <span title={data.address}>{data.name || data.address}</span>;
  }

  return <span title={address}>{address}</span>;
};
