import { Suspense } from 'react';
import useSWR from 'swr';
import DeprecatedSpacer from './core/Spacer/DeprecatedSpacer';
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
  <Suspense
    fallback={
      // TODO: fallback that takes the height of the text element would appear post-fetch.
      // long-term, we're going to holistically re-think loading states on the app
      <DeprecatedSpacer height={18} />
    }
  >
    <PlainErrorBoundary fallback={<span title={address}>{address}</span>}>
      <EnsName address={address} />
    </PlainErrorBoundary>
  </Suspense>
);
