import { graphql, readInlineData } from 'relay-runtime';

import { extractRelevantMetadataFromTokenFragment$key } from '~/generated/extractRelevantMetadataFromTokenFragment.graphql';

import { isChainEvm } from './chains';
import { extractMirrorXyzUrl } from './extractMirrorXyzUrl';
import { DateFormatOption, getFormattedDate } from './getFormattedDate';
import { getOpenseaExternalUrl, hexHandler } from './getOpenseaExternalUrl';
import getProhibitionUrl from './getProhibitionUrl';
import { getFxHashExternalUrl, getObjktExternalUrl } from './getTezosExternalUrl';
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
    result.tokenId = hexHandler(tokenId);
  }

  if (contractAddress && tokenId) {
    result.prohibitionUrl = getProhibitionUrl(contractAddress, result.tokenId);
    result.fxhashUrl = getFxHashExternalUrl(contractAddress, result.tokenId);
    result.objktUrl = getObjktExternalUrl(contractAddress, result.tokenId);
    if (
      chain &&
      // eslint-disable-next-line relay/no-future-added-value
      chain !== '%future added value' &&
      isChainEvm(chain)
    ) {
      result.openseaUrl = getOpenseaExternalUrl(chain, contractAddress, result.tokenId);
    }
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
