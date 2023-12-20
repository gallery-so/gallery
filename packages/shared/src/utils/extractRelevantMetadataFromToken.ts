import { graphql, readInlineData } from 'relay-runtime';

import { extractRelevantMetadataFromTokenFragment$key } from '~/generated/extractRelevantMetadataFromTokenFragment.graphql';

import { isChainEvm } from './chains';
import { extractMirrorXyzUrl } from './extractMirrorXyzUrl';
import { DateFormatOption, getFormattedDate } from './getFormattedDate';
import { getOpenseaExternalUrlDangerously } from './getOpenseaExternalUrl';
import {
  getFxHashExternalUrlDangerously,
  getObjktExternalUrlDangerously,
  isFxHashContractAddress,
} from './getTezosExternalUrl';
import { hexToDec } from './hexToDec';
import processProjectUrl from './processProjectUrl';
import { getProhibitionUrlDangerously } from './prohibition';
import { truncateAddress } from './wallet';

export type CommunitySubtype = 'ContractCommunity' | 'ArtBlocksCommunity';

export function extractRelevantMetadataFromToken(
  tokenRef: extractRelevantMetadataFromTokenFragment$key
) {
  const token = readInlineData(
    graphql`
      fragment extractRelevantMetadataFromTokenFragment on Token @inline {
        definition {
          tokenId
          tokenMetadata
          externalUrl
          chain
          lastUpdated
          community {
            name
            mintURL
            subtype {
              __typename
              ... on ArtBlocksCommunity {
                projectID
              }
            }
          }
          contract {
            contractAddress {
              address
            }
          }
        }
      }
    `,
    tokenRef
  );

  const {
    tokenId,
    contract,
    community,
    externalUrl,
    tokenMetadata,
    chain,
    lastUpdated: lastUpdatedRaw,
  } = token.definition;

  const contractAddress = contract?.contractAddress?.address ?? '';
  const communitySubtype = (community?.subtype?.__typename ??
    'ContractCommunity') as CommunitySubtype;
  const communityProjectId =
    community?.subtype?.__typename === 'ArtBlocksCommunity'
      ? community.subtype.projectID ?? ''
      : '';

  const result = {
    tokenId: '',
    chain: chain ?? '',
    contractAddress,
    contractName: '',
    communitySubtype,
    communityProjectId,
    lastUpdated: '',
    mintUrl: community?.mintURL ?? '',
    openseaUrl: '',
    mirrorUrl: '',
    prohibitionUrl: '',
    fxhashUrl: '',
    objktUrl: '',
    // the official URL provided by the project, which we'll typically
    // link to under `More Info`
    projectUrl: '',
  };

  if (tokenId) {
    result.tokenId = hexToDec(tokenId);
  }

  if (contractAddress && tokenId) {
    result.prohibitionUrl = getProhibitionUrlDangerously(contractAddress, tokenId);
    result.fxhashUrl = getFxHashExternalUrlDangerously(contractAddress, tokenId);
    result.objktUrl = getObjktExternalUrlDangerously(contractAddress, tokenId);
    if (
      chain &&
      // eslint-disable-next-line relay/no-future-added-value
      chain !== '%future added value' &&
      isChainEvm(chain)
    ) {
      result.openseaUrl = getOpenseaExternalUrlDangerously(chain, contractAddress, tokenId);
    }
  }

  if (isFxHashContractAddress(contractAddress)) {
    result.contractName = 'fx(hash)';
  } else if (community?.name) {
    result.contractName = community.name;
  } else if (contractAddress) {
    result.contractName = truncateAddress(contractAddress);
  } else {
    result.contractName = 'Untitled Contract';
  }

  if (tokenMetadata) {
    result.mirrorUrl = extractMirrorXyzUrl(tokenMetadata);
  }

  if (externalUrl) {
    result.projectUrl = processProjectUrl(externalUrl);
  }

  result.lastUpdated = getFormattedDate(lastUpdatedRaw, DateFormatOption.ABBREVIATED);

  return result;
}
