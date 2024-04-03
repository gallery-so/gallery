import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { NftSelectorContractFragment$key } from '~/generated/NftSelectorContractFragment.graphql';

import { NftSelectorContractHeader } from './NftSelectorContractHeader';
import { NftSelectorContractPickerGrid } from './NftSelectorContractPickerGrid';
import { NftSelectorContractWrapper } from './NftSelectorContractWrapper';

type Props = {
  contractAddress: string;
  onSelectNft: (tokenId: string) => void;
  queryRef: NftSelectorContractFragment$key;
  isCreator: boolean;
  isFullScreen?: boolean;
};

export function NftSelectorContract({
  contractAddress,
  isCreator,
  isFullScreen,
  onSelectNft,
  queryRef,
}: Props) {
  const query = useFragment(
    graphql`
      fragment NftSelectorContractFragment on Query {
        viewer {
          ... on Viewer {
            user {
              tokens {
                __typename
                definition {
                  contract {
                    dbid
                    name
                    contractAddress {
                      address
                    }
                  }
                }
                ...NftSelectorContractPickerGridFragment
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const nonNullableTokens = useMemo(() => {
    const tokens = [];

    for (const token of query.viewer?.user?.tokens ?? []) {
      if (token?.definition?.contract?.contractAddress?.address === contractAddress) {
        tokens.push(token);
      }
    }

    return tokens;
  }, [query.viewer?.user?.tokens, contractAddress]);

  const contractName = nonNullableTokens[0]?.definition?.contract?.name ?? '';
  const contractId = nonNullableTokens[0]?.definition?.contract?.dbid ?? '';

  return (
    <NftSelectorContractWrapper isFullscreen={isFullScreen}>
      <NftSelectorContractHeader
        title={contractName}
        isCreator={isCreator}
        contractId={contractId}
      />
      <NftSelectorContractPickerGrid
        isCreator={isCreator}
        tokenRefs={nonNullableTokens}
        onSelect={onSelectNft}
      />
    </NftSelectorContractWrapper>
  );
}
