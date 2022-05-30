import { useCallback } from 'react';
import styled from 'styled-components';
import { useModalActions } from 'contexts/modal/ModalContext';
import WalletSelector from 'components/WalletSelector/WalletSelector';
import { CONNECT_WALLET_ONLY } from 'types/Wallet';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import { useWalletModalQuery } from '__generated__/useWalletModalQuery.graphql';
import { useWalletModalFragment$key } from '__generated__/useWalletModalFragment.graphql';
import { MODAL_PADDING_PX } from 'contexts/modal/AnimatedModal';
import { useIsMobileOrMobileLargeWindowWidth } from './useWindowSize';

type ModalProps = {
  queryRef: useWalletModalFragment$key;
};

const WalletModal = ({ queryRef }: ModalProps) => {
  const query = useFragment(
    graphql`
      fragment useWalletModalFragment on Query {
        ...WalletSelectorFragment
      }
    `,
    queryRef
  );

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  return (
    <Container isMobile={isMobile}>
      <WalletSelector connectionMode={CONNECT_WALLET_ONLY} queryRef={query} />
    </Container>
  );
};

export default function useWalletModal() {
  const { showModal } = useModalActions();

  const query = useLazyLoadQuery<useWalletModalQuery>(
    graphql`
      query useWalletModalQuery {
        ...useWalletModalFragment
      }
    `,
    {}
  );

  return useCallback(() => {
    showModal({ content: <WalletModal queryRef={query} /> });
  }, [query, showModal]);
}

const Container = styled.div<{ isMobile: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;

  // the height of the inner content with all wallet options listed.
  // ensures the height of the modal doesn't shift
  min-height: 360px;
  height: 100%;

  padding: ${({ isMobile }) => `${isMobile ? MODAL_PADDING_PX : 0}px`};
`;
