import { useCallback } from 'react';
import { useFragment, useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { HStack } from '~/components/core/Spacer/Stack';
import { TitleL } from '~/components/core/Text/Text';
import { OnConnectWalletSuccessFn } from '~/components/WalletSelector/multichain/MultichainWalletSelector';
import WalletSelector from '~/components/WalletSelector/WalletSelector';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { useAddWalletModalFragment$key } from '~/generated/useAddWalletModalFragment.graphql';
import { useAddWalletModalQuery } from '~/generated/useAddWalletModalQuery.graphql';
import { ADD_WALLET_TO_USER } from '~/types/Wallet';

type ModalProps = {
  queryRef: useAddWalletModalFragment$key;
  onConnectWalletSuccess?: OnConnectWalletSuccessFn;
};

const AddWalletModal = ({ queryRef, onConnectWalletSuccess }: ModalProps) => {
  const query = useFragment(
    graphql`
      fragment useAddWalletModalFragment on Query {
        ...WalletSelectorFragment
      }
    `,
    queryRef
  );

  return (
    <Container>
      <WalletSelector
        connectionMode={ADD_WALLET_TO_USER}
        queryRef={query}
        onConnectWalletSuccess={onConnectWalletSuccess}
        showEmail={false}
      />
      <StyledWalletText>
        Gallery is a limitless creative canvas for <span>curation</span>, <span>connection</span>,
        and <span>self expression</span> in web3
      </StyledWalletText>
    </Container>
  );
};

type Props = {
  onConnectWalletSuccess?: OnConnectWalletSuccessFn;
};

export default function useAddWalletModal() {
  const { showModal } = useModalActions();

  const query = useLazyLoadQuery<useAddWalletModalQuery>(
    graphql`
      query useAddWalletModalQuery {
        ...useAddWalletModalFragment
      }
    `,
    {}
  );

  return useCallback(
    ({ onConnectWalletSuccess }: Props) => {
      showModal({
        id: 'add-wallet-modal',
        content: (
          <AddWalletModal queryRef={query} onConnectWalletSuccess={onConnectWalletSuccess} />
        ),
        headerText: 'Sign in or create an account',
      });
    },
    [query, showModal]
  );
}

const Container = styled(HStack).attrs({
  justify: 'center',
})`
  min-height: 280px;
  height: 100%;

  flex-direction: column-reverse;
  gap: 24px;

  padding-top: 24px;

  @media only screen and ${breakpoints.tablet} {
    min-height: 280px;
    height: 100%;
    align-items: center;
    flex-direction: row;
    padding-top: 0;
  }
`;

const StyledWalletText = styled(TitleL)`
  display: block;
  text-align: center;
  width: 100%;

  span {
    font-style: italic;
  }
  @media only screen and ${breakpoints.tablet} {
    font-weight: 300;
    width: 300px;
  }
`;
