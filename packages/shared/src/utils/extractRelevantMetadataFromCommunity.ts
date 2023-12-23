import { graphql, readInlineData } from 'relay-runtime';

import { extractRelevantMetadataFromCommunityFragment$key } from '~/generated/extractRelevantMetadataFromCommunityFragment.graphql';

import { Chain, isChainEvm } from './chains';
import { CommunitySubtype } from './extractRelevantMetadataFromToken';
import { getOpenseaExternalUrlDangerouslyForCollection } from './getOpenseaExternalUrl';
import { getObjktExternalUrlDangerouslyForCollection } from './getTezosExternalUrl';
import { getExternalAddressLink } from './wallet';

export function extractRelevantMetadataFromCommunity(
  communityRef: extractRelevantMetadataFromCommunityFragment$key
) {
  const community = readInlineData(
    graphql`
      fragment extractRelevantMetadataFromCommunityFragment on Community @inline {
        subtype {
          __typename
          ... on ContractCommunity {
            communityKey {
              contract {
                address
                chain
                ...walletGetExternalAddressLinkFragment
              }
            }
          }
          ... on ArtBlocksCommunity {
            communityKey {
              contract {
                address
                chain
                ...walletGetExternalAddressLinkFragment
              }
            }
            projectID
          }
        }
        mintURL
      }
    `,
    communityRef
  );

  const result = {
    chain: 'Ethereum' as Chain,
    contractAddress: '',
    openseaUrl: '',
    objktUrl: '',
    externalAddressUrl: '',
    projectId: '',
    subtype: 'ContractCommunity' as CommunitySubtype,
    mintUrl: community.mintURL ?? '',
  };

  if (!community.subtype || community.subtype?.__typename === '%other') {
    return result;
  } else {
    result.subtype = community.subtype.__typename;
  }

  if (community.subtype?.__typename === 'ArtBlocksCommunity') {
    result.projectId = community.subtype?.projectID ?? '';
  }

  if (community.subtype?.communityKey?.contract?.address) {
    const chain = community.subtype.communityKey.contract.chain;
    const address = community.subtype.communityKey.contract.address;

    // @ts-expect-error: relay error, no need to check for %future added value
    result.chain = chain ?? 'Ethereum';
    result.contractAddress = address ?? '';

    if (chain === 'Tezos') {
      result.objktUrl = getObjktExternalUrlDangerouslyForCollection(address);
    }

    result.externalAddressUrl =
      getExternalAddressLink(community.subtype.communityKey.contract) ?? '';

    if (
      chain &&
      // eslint-disable-next-line relay/no-future-added-value
      chain !== '%future added value' &&
      isChainEvm(chain)
    ) {
      result.openseaUrl = getOpenseaExternalUrlDangerouslyForCollection(chain, address);
    }
  }

  return result;
}
