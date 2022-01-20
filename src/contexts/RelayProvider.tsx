import { ReactNode, useState } from 'react';
import RelayModernEnvironment from 'relay-runtime/lib/store/RelayModernEnvironment';
import { Environment, RelayEnvironmentProvider } from 'react-relay';
import { FetchFunction, Network, RecordSource, Store } from 'relay-runtime';
import { _fetch } from 'contexts/swr/useFetcher';
import { MembershipTier } from 'types/MembershipTier';
import { RecordMap } from 'relay-runtime/lib/store/RelayStoreTypes';

export const serializeRelayEnvironment = (environment: Environment) =>
  environment.getStore().getSource().toJSON();

export const createServerSideRelayEnvironment = (): Environment =>
  new RelayModernEnvironment({
    store: new Store(new RecordSource({})),
    network: Network.create(fetchFunction),
  });

export const createRelayEnvironmentFromRecords = (records?: RecordMap): Environment =>
  new RelayModernEnvironment({
    store: new Store(new RecordSource(records ?? {})),
    network: Network.create(fetchFunction),
  });

const fetchFunction: FetchFunction = async (request, variables) => {
  if (request.name === 'membersQuery') {
    const response = await _fetch<{ tiers: MembershipTier[] }>('/users/membership', 'some action');

    return {
      data: {
        membershipTiers: response.tiers.map((tier) => ({
          id: tier.id,
          name: tier.name,
          assetUrl: tier.asset_url,
          tokenId: tier.token_id,
          owners: tier.owners
            .filter((owner) => Boolean(owner.username))
            .map((owner) => ({
              id: `${owner.address}:${owner.username}:${owner.user_id}`,
              user: {
                id: owner.user_id,
                username: owner.username,
              },
              previewNfts: owner.preview_nfts,
            })),
        })),
      },
    };
  }

  throw new Error(`Relay fetch function not yet implemented for: ${request.name}`);
};

export function RelayProvider({
  children,
  initialCache,
}: {
  children: ReactNode;
  initialCache?: RecordMap;
}) {
  const [relayEnvironment] = useState(() => createRelayEnvironmentFromRecords(initialCache));

  return (
    <RelayEnvironmentProvider environment={relayEnvironment}>{children}</RelayEnvironmentProvider>
  );
}
