import { graphql, readInlineData } from 'relay-runtime';

import { extractRelevantMetadataFromCommunityFragment$key } from '~/generated/extractRelevantMetadataFromCommunityFragment.graphql';

import { isChainEvm } from './chains';
import { extractMirrorXyzUrl } from './extractMirrorXyzUrl';
import { getOpenseaExternalUrlDangerouslyForCollection } from './getOpenseaExternalUrl';
import {
  getFxHashExternalUrlDangerouslyForCollection,
  getObjktExternalUrlDangerouslyForCollection,
  isFxHashContractAddress,
} from './getTezosExternalUrl';
import processProjectUrl from './processProjectUrl';
import { getProhibitionUrlDangerouslyForCollection } from './prohibition';
import { truncateAddress } from './wallet';

export function extractRelevantMetadataFromCommunity(
  communityRef: extractRelevantMetadataFromCommunityFragment$key
) {
  const community = readInlineData(
    graphql`
      fragment extractRelevantMetadataFromCommunityFragment on Community @inline {
        id
        name
        chain
        contract {
          name
          contractAddress {
            address
          }
        }
      }
    `,
    communityRef
  );

  const { name, contract, chain } = community;

  const contractAddress = contract?.contractAddress?.address;
  console.log('name', name);
  const result = {
    contractAddress,
    contractName: '',
    openseaUrl: '',
    mirrorUrl: '',
    prohibitionUrl: '',
    fxhashUrl: '',
    objktUrl: '',
    // the official URL provided by the project, which we'll typically
    // link to under `More Info`
    projectUrl: '',
  };

  const collectionName = name?.toLocaleLowerCase().replace(' ', '-') ?? '';
  if (contractAddress && collectionName) {
    result.prohibitionUrl = getProhibitionUrlDangerouslyForCollection(
      contractAddress,
      collectionName
    );
    result.fxhashUrl = getFxHashExternalUrlDangerouslyForCollection(
      contractAddress,
      collectionName
    );
    result.objktUrl = getObjktExternalUrlDangerouslyForCollection(contractAddress);
    if (
      chain &&
      // eslint-disable-next-line relay/no-future-added-value
      chain !== '%future added value' &&
      isChainEvm(chain)
    ) {
      result.openseaUrl = getOpenseaExternalUrlDangerouslyForCollection(collectionName);
    }
  }

  if (isFxHashContractAddress(contractAddress)) {
    result.contractName = 'fx(hash)';
  } else if (contract?.name) {
    result.contractName = contract.name;
  } else if (contractAddress) {
    result.contractName = truncateAddress(contractAddress);
  } else {
    result.contractName = 'Untitled Contract';
  }

  /*
  if (tokenMetadata) {
    result.mirrorUrl = extractMirrorXyzUrl(tokenMetadata);
  }

  if (externalUrl) {
    result.projectUrl = processProjectUrl(externalUrl);
  }

*/
  return result;
}
