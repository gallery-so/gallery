import { FetchFunction, GraphQLResponse } from 'relay-runtime';
import { _fetch, baseurl } from 'contexts/swr/useFetcher';
import { MembershipTier } from 'types/MembershipTier';

/**
 * This is how Relay takes an arbitrary GraphQL request, and asks for a response.
 * Since we don't currently have a GraphQL server, we're shimming a response as
 * an example.
 */
export const relayFetchFunction: FetchFunction = async (request, variables) => {
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

  return _fetch<GraphQLResponse>(`${baseurl}/glry/graphql/query`, 'graphql request', {
    body: {
      query: request.text,
      variables,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
