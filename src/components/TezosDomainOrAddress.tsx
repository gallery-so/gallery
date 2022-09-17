import { Suspense } from 'react';
import useSWR from 'swr';
import { PlainErrorBoundary } from './PlainErrorBoundary';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { LinkableAddress, RawLinkableAddress } from 'components/LinkableAddress';
import { TezosDomainOrAddressFragment$key } from '../../__generated__/TezosDomainOrAddressFragment.graphql';
import { TezosDomainOrAddressWithSuspenseFragment$key } from '../../__generated__/TezosDomainOrAddressWithSuspenseFragment.graphql';
import { TezosToolkit } from '@taquito/taquito';
import { TaquitoTezosDomainsClient } from '@tezos-domains/taquito-client';
import { Tzip16Module } from '@taquito/tzip16';
import { getExternalAddressLink } from 'utils/wallet';

async function tezosDomainFetcher(address: string): Promise<string | null> {
  const tezos = new TezosToolkit('https://mainnet.api.tez.ie');
  tezos.addExtension(new Tzip16Module());
  const client = new TaquitoTezosDomainsClient({ network: 'mainnet', tezos });

  return await client.resolver.resolveAddressToName(address);
}

type TezosDomainProps = {
  chainAddressRef: TezosDomainOrAddressFragment$key;
};

const TezosDomain = ({ chainAddressRef }: TezosDomainProps) => {
  const address = useFragment(
    graphql`
      fragment TezosDomainOrAddressFragment on ChainAddress {
        address @required(action: THROW)

        ...LinkableAddressFragment
        ...walletGetExternalAddressLinkFragment
      }
    `,
    chainAddressRef
  );

  const { data: domain } = useSWR(address.address, tezosDomainFetcher);

  const link = getExternalAddressLink(address);

  if (domain && link) {
    return <RawLinkableAddress link={link} address={address.address} truncatedAddress={domain} />;
  }

  // If we couldn't resolve, let's fallback to the default component
  return <LinkableAddress chainAddressRef={address} />;
};

type TezosDomainOrAddressProps = {
  chainAddressRef: TezosDomainOrAddressWithSuspenseFragment$key;
};

export const TezosDomainOrAddress = ({ chainAddressRef }: TezosDomainOrAddressProps) => {
  const address = useFragment(
    graphql`
      fragment TezosDomainOrAddressWithSuspenseFragment on ChainAddress {
        address

        ...TezosDomainOrAddressFragment
        ...LinkableAddressFragment
      }
    `,
    chainAddressRef
  );

  return (
    <Suspense fallback={<LinkableAddress chainAddressRef={address} />}>
      <PlainErrorBoundary fallback={<LinkableAddress chainAddressRef={address} />}>
        <TezosDomain chainAddressRef={address} />
      </PlainErrorBoundary>
    </Suspense>
  );
};
