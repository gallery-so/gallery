import { useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { NftSelectorTokenFragment$data } from '~/generated/NftSelectorTokenFragment.graphql';
import { useNftSelectorFragment$key } from '~/generated/useNftSelectorFragment.graphql';
import { useNftSelectorQueryFragment$key } from '~/generated/useNftSelectorQueryFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { NftSelector } from './NftSelector';
import useUpdateProfileImage from './useUpdateProfileImage';

type Props = {
  tokensRef: useNftSelectorFragment$key;
  queryRef: useNftSelectorQueryFragment$key;
  onSelectToken: (token: NftSelectorTokenFragment$data) => void;
  headerText: string;
};

export default function useNftSelector({ tokensRef, queryRef, onSelectToken, headerText }: Props) {
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
      content: (
        <NftSelector
          tokensRef={nonNullTokens}
          queryRef={query}
          onSelectToken={onSelectToken}
          headerText={headerText}
        />
      ),
    });
  }, [headerText, nonNullTokens, onSelectToken, query, showModal]);
}

type RefProps = {
  tokensRef: useNftSelectorFragment$key;
  queryRef: useNftSelectorQueryFragment$key;
};

export function useNftSelectorForProfilePicture({ tokensRef, queryRef }: RefProps) {
  const { setProfileImage } = useUpdateProfileImage();
  const { hideModal } = useModalActions();

  const handleSelectToken = useCallback(
    (token: NftSelectorTokenFragment$data) => {
      setProfileImage({ tokenId: token.dbid });
      hideModal();
    },
    [hideModal, setProfileImage]
  );

  return useNftSelector({
    tokensRef: tokensRef,
    queryRef: queryRef,
    onSelectToken: handleSelectToken,
    headerText: 'Select profile picture',
  });
}
