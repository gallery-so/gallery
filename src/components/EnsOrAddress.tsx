import useSWR from 'swr';
import { PlainErrorBoundary } from './PlainErrorBoundary';

type Props = {
  address?: string;
};

const EnsName = ({ address }: Props) => {
  const { data } = useSWR(
    address
      ? `https://api.ensideas.com/ens/resolve/${encodeURIComponent(address.toLowerCase())}`
      : null
  );

  if (data?.address) {
    return <span title={data.address}>{data.name || data.address}</span>;
  }

  return <span title={address}>{address}</span>;
};

export const EnsOrAddress = ({ address }: Props) => (
  <PlainErrorBoundary fallback={<span title={address}>{address}</span>}>
    <EnsName address={address} />
  </PlainErrorBoundary>
);
