import { TezosToolkit } from '@taquito/taquito';
import { Tzip16Module } from '@taquito/tzip16';
import { TaquitoTezosDomainsClient } from '@tezos-domains/taquito-client';
import { Suspense } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import useSWR from 'swr';

import { LinkableAddress, RawLinkableAddress } from '~/components/LinkableAddress';
import { TezosDomainOrAddressFragment$key } from '~/generated/TezosDomainOrAddressFragment.graphql';
import { TezosDomainOrAddressWithSuspenseFragment$key } from '~/generated/TezosDomainOrAddressWithSuspenseFragment.graphql';
import { GalleryElementTrackingProps } from '~/shared/contexts/AnalyticsContext';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import { getExternalAddressLink } from '~/shared/utils/wallet';

async function tezosDomainFetcher(address: string): Promise<string | null> {
  const tezos = new TezosToolkit('https://mainnet.api.tez.ie');
  tezos.addExtension(new Tzip16Module());
  const client = new TaquitoTezosDomainsClient({ network: 'mainnet', tezos });

  return await client.resolver.resolveAddressToName(address);
}

type TezosDomainProps = {
  chainAddressRef: TezosDomainOrAddressFragment$key;
  eventContext: GalleryElementTrackingProps['eventContext'];
};

const TezosDomain = ({ chainAddressRef, eventContext }: TezosDomainProps) => {
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
    return (
      <RawLinkableAddress
        link={link}
        address={address.address}
        truncatedAddress={domain}
        eventContext={eventContext}
      />
    );
  }

  // If we couldn't resolve, let's fallback to the default component
  return <LinkableAddress chainAddressRef={address} eventContext={eventContext} />;
};

type TezosDomainOrAddressProps = {
  chainAddressRef: TezosDomainOrAddressWithSuspenseFragment$key;
  eventContext: GalleryElementTrackingProps['eventContext'];
};

export const TezosDomainOrAddress = ({
  chainAddressRef,
  eventContext,
}: TezosDomainOrAddressProps) => {
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
    <Suspense fallback={<LinkableAddress chainAddressRef={address} eventContext={eventContext} />}>
      <ReportingErrorBoundary
        fallback={<LinkableAddress chainAddressRef={address} eventContext={eventContext} />}
      >
        <TezosDomain chainAddressRef={address} eventContext={eventContext} />
      </ReportingErrorBoundary>
    </Suspense>
  );
};
