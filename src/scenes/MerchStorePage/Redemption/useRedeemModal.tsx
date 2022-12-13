import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';

import EthereumProviders from '~/contexts/auth/EthereumProviders';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { useRedeemModalQueryFragment$key } from '~/generated/useRedeemModalQueryFragment.graphql';

import RedeemModal from './RedeemModal';

export default function useRedeemModal(queryRef: useRedeemModalQueryFragment$key) {
  const query = useFragment(
    graphql`
      fragment useRedeemModalQueryFragment on MerchTokensPayload {
        ...RedeemModalQueryFragment
      }
    `,
    queryRef
  );

  const { showModal } = useModalActions();

  return useCallback(() => {
    showModal({
      content: (
        <EthereumProviders>
          <RedeemModal queryRef={query} />
        </EthereumProviders>
      ),
    });
  }, [query, showModal]);
}
