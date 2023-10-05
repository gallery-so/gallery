import { graphql, readInlineData } from 'relay-runtime';

import { extractRelevantMetadataFromTokenFragment$key } from '~/generated/extractRelevantMetadataFromTokenFragment.graphql';

import { isChainEvm } from './chains';
import { extractMirrorXyzUrl } from './extractMirrorXyzUrl';
import { DateFormatOption, getFormattedDate } from './getFormattedDate';
import { getOpenseaExternalUrlDangerously } from './getOpenseaExternalUrl';
import { getProhibitionUrlDangerously } from './getProhibitionUrl';
import {
  getFxHashExternalUrlDangerously,
  getObjktExternalUrlDangerously,
  isFxHashContractAddress,
} from './getTezosExternalUrl';
import { hexToDec } from './hexToDec';
import processProjectUrl from './processProjectUrl';

export function extractRelevantMetadataFromToken(
  tokenRef: extractRelevantMetadataFromTokenFragment$key
) {
  const token = readInlineData(
    graphql`
      fragment extractRelevantMetadataFromTokenFragment on Token @inline {
        tokenId
        tokenMetadata
        externalUrl
        chain
        lastUpdated
        contract {
          name
          contractAddress {
            address
          }
        }
      }
    `,
    tokenRef
  );

  const {
    tokenId,
    contract,
    externalUrl,
    tokenMetadata,
    chain,
    lastUpdated: lastUpdatedRaw,
  } = token;

  const contractAddress = contract?.contractAddress?.address;

  const result = {
    tokenId: '',
    contractAddress,
    contractName: '',
    lastUpdated: '',
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

  result.contractName = isFxHashContractAddress(contractAddress)
    ? 'fx(hash)'
    : contract?.name ?? 'Untitled Contract';

  if (tokenMetadata) {
    result.mirrorUrl = extractMirrorXyzUrl(tokenMetadata);
  }

  if (externalUrl) {
    result.projectUrl = processProjectUrl(externalUrl);
  }

  result.lastUpdated = getFormattedDate(lastUpdatedRaw, DateFormatOption.ABBREVIATED);

  return result;
}
