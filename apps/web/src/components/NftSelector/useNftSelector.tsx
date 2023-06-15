import { useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { useNftSelectorQueryFragment$key } from '~/generated/useNftSelectorQueryFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { NftSelector } from './NftSelector';

export default function useNftSelector(queryRef: useNftSelectorQueryFragment$key) {
  const tokens = useFragment(
    graphql`
      fragment useNftSelectorQueryFragment on Token @relay(plural: true) {
        ...NftSelectorQueryFragment
      }
    `,
    queryRef
  );

  const nonNullTokens = removeNullValues(tokens ?? []);

  const { showModal } = useModalActions();

  return useCallback(() => {
    showModal({
      content: <NftSelector queryRef={nonNullTokens} />,
    });
  }, [nonNullTokens, showModal]);
}
