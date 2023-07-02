import { useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { useNftSelectorFragment$key } from '~/generated/useNftSelectorFragment.graphql';
import { useNftSelectorQueryFragment$key } from '~/generated/useNftSelectorQueryFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { NftSelector } from './NftSelector';

type Props = {
  tokensRef: useNftSelectorFragment$key;
  queryRef: useNftSelectorQueryFragment$key;
};

export default function useNftSelector({ tokensRef, queryRef }: Props) {
  const tokens = useFragment(
    graphql`
      fragment useNftSelectorFragment on Token @relay(plural: true) {
        ...NftSelectorFragment
      }
    `,
    tokensRef
  );

  const query = useFragment(
    graphql`
      fragment useNftSelectorQueryFragment on Query {
        ...NftSelectorQueryFragment
      }
    `,
    queryRef
  );

  const nonNullTokens = removeNullValues(tokens ?? []);

  const { showModal } = useModalActions();

  return useCallback(() => {
    showModal({
      content: <NftSelector tokensRef={nonNullTokens} queryRef={query} />,
    });
  }, [nonNullTokens, query, showModal]);
}
