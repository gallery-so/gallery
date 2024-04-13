import { useCallback, useMemo, useState } from 'react';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import IconContainer from '~/components/core/IconContainer';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleS } from '~/components/core/Text/Text';
import transitions from '~/components/core/transitions';
import { ConnectedFarcasterLoginView } from '~/components/WalletSelector/multichain/FarcasterLoginView';
import MagicLinkLogin from '~/components/WalletSelector/multichain/MagicLinkLogin';
import { WalletSelectorWrapper } from '~/components/WalletSelector/multichain/WalletSelectorWrapper';
import WalletSelector from '~/components/WalletSelector/WalletSelector';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { useUniversalAuthModalQuery } from '~/generated/useUniversalAuthModalQuery.graphql';
import { useUniversalAuthModalQueryFragment$key } from '~/generated/useUniversalAuthModalQueryFragment.graphql';
import { ChevronLeftIcon } from '~/icons/ChevronLeftIcon';
import { EmailIcon } from '~/icons/EmailIcon';
import { FarcasterOutlineIcon } from '~/icons/FarcasterOutlineIcon';
import { WalletIcon } from '~/icons/WalletIcon';

type authMethod = 'Wallet' | 'Email' | 'Farcaster' | 'Sign in via mobile';

export default function useUniversalAuthModal() {
  const query = useLazyLoadQuery<useUniversalAuthModalQuery>(
    graphql`
      query useUniversalAuthModalQuery {
        ...useUniversalAuthModalQueryFragment
      }
    `,
    {}
  );

  const { showModal } = useModalActions();

  return useCallback(() => {
    showModal({
      id: 'auth',
      content: <UniversalAuthModal queryRef={query} />,
    });
  }, [showModal, query]);
}

type UniversalAuthModalProps = {
  queryRef: useUniversalAuthModalQueryFragment$key;
};

function UniversalAuthModal({ queryRef }: UniversalAuthModalProps) {
  const query = useFragment(
    graphql`
      fragment useUniversalAuthModalQueryFragment on Query {
        ...WalletSelectorFragment
      }
    `,
    queryRef
  );

  const [selectedAuthMethod, setSelectedAuthMethod] = useState<authMethod | null>(null);

  const modalTitle = useMemo(() => {
    if (selectedAuthMethod === 'Wallet') {
      return 'Continue with wallet';
    }

    if (selectedAuthMethod === 'Farcaster') {
      return 'Sign in with Farcaster';
    }

    return 'Sign in or create an account';
  }, [selectedAuthMethod]);

  const headerElement = useMemo(() => {
    return (
      <HeaderMarginAdjuster>
        <HStack align="center" gap={8}>
          {selectedAuthMethod && (
            <IconMarginAdjuster>
              <IconContainer
                onClick={() => setSelectedAuthMethod(null)}
                variant="default"
                size="sm"
                icon={<ChevronLeftIcon />}
              />
            </IconMarginAdjuster>
          )}
          <VStack>
            <TitleS color={colors.black['800']}>{modalTitle}</TitleS>
          </VStack>
        </HStack>
      </HeaderMarginAdjuster>
    );
  }, [modalTitle, selectedAuthMethod]);

  return (
    <VStack>
      {headerElement}
      <Container>
        {selectedAuthMethod === 'Wallet' && (
          <WalletContainer gap={12}>
            <WalletSelector queryRef={query} showEmail={false} />
          </WalletContainer>
        )}

        {selectedAuthMethod === 'Farcaster' && (
          <WalletSelectorWrapper>
            <ConnectedFarcasterLoginView />
          </WalletSelectorWrapper>
        )}

        {selectedAuthMethod === 'Email' && (
          <WalletSelectorWrapper>
            <MagicLinkLogin />
          </WalletSelectorWrapper>
        )}

        {!selectedAuthMethod && (
          <WalletSelectorWrapper gap={12}>
            <Row
              label="Wallet"
              disabled={false}
              onClick={() => setSelectedAuthMethod('Wallet')}
              icon={<WalletIcon />}
            />
            <Row
              label="Farcaster"
              disabled={false}
              onClick={() => setSelectedAuthMethod('Farcaster')}
              icon={<FarcasterOutlineIcon />}
            />
            <Row
              label="Email"
              disabled={false}
              onClick={() => setSelectedAuthMethod('Email')}
              icon={<EmailIcon />}
            />
          </WalletSelectorWrapper>
        )}
      </Container>
    </VStack>
  );
}

const Container = styled(VStack)`
  display: flex;
  justify-content: center;

  padding: 24px 0px 8px;
  // the height of the inner content with all wallet options listed.
  // ensures the height of the modal doesn't shift
  /* min-height: 320px; */
  height: 100%;
`;

const HeaderMarginAdjuster = styled.div`
  margin-top: -6px;
`;

const IconMarginAdjuster = styled.div`
  margin-left: -8px;
`;

const WalletContainer = styled(VStack)`
  width: 100%;

  @media only screen and ${breakpoints.tablet} {
    min-width: 400px;
  }
`;

type RowProps = {
  label: string;
  disabled: boolean;
  icon?: React.ReactElement;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

function Row({ label, disabled, icon, ...buttonProps }: RowProps) {
  return (
    <StyledButton {...buttonProps}>
      <StyledContent align="center" justify="space-between">
        <VStack align="baseline">
          <TitleS color={colors.black['800']}>{label}</TitleS>
        </VStack>
        <StyledButtonIcon>{icon}</StyledButtonIcon>
      </StyledContent>
    </StyledButton>
  );
}

const StyledContent = styled(HStack)`
  width: 100%;
`;

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;

  background: ${colors.white};
  border: 1px solid ${colors.black['800']};
  padding: 16px;
  font-size: 16px;
  transition: border-color ${transitions.cubic};

  :enabled {
    cursor: pointer;
    &:hover {
      border-color: ${colors.black['800']};
      background: ${colors.faint};
    }
  }

  ${BaseM} {
    color: ${colors.black['800']};
  }
`;

const StyledButtonIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;
