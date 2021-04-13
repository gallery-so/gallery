import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { injected, walletconnect } from 'connectors/index';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthActions, useAuthState } from 'contexts/auth/AuthContext';
import { useModal } from 'contexts/modal/ModalContext';
import WalletButton from './WalletButton';
import { isLoggedInState } from 'contexts/auth/types';
import colors from 'components/core/colors';

const walletConnectorMap: Record<string, AbstractConnector> = {
  Metamask: injected,
  WalletConnect: walletconnect,
};

type ErrorMessage = {
  heading: string;
  body: string;
};

const ERROR_MESSAGES: { [key: string]: ErrorMessage } = {
  REJECTED_SIGNATURE: {
    heading: 'Signature rejected',
    body: 'Please sign the message with your wallet to continue',
  },
  UNKNOWN_ERROR: {
    heading: 'There was an error connecting',
    body: 'Please try again',
  },
};

function getErrorMessage(errorCode: string) {
  return ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.UNKNOWN_ERROR;
}

function WalletSelector() {
  const context = useWeb3React<Web3Provider>();
  const authState = useAuthState();
  const isLoggedIn = isLoggedInState(authState);
  const { library, account, activate, deactivate, active } = context;

  const [isConnecting, setIsConnecting] = useState(false);
  const [errorCode, setErrorCode] = useState('');

  const enableIsConnectingState = useCallback(() => {
    setIsConnecting(true);
  }, []);

  const retryConnectWallet = useCallback(() => {
    setIsConnecting(false);
    setErrorCode('');
    deactivate();
  }, [deactivate]);

  const signer = useMemo(() => {
    return library && account ? library.getSigner(account) : undefined;
  }, [library, account]);

  const { logIn } = useAuthActions();
  const { hideModal } = useModal();

  useEffect(() => {
    if (account && isConnecting && !isLoggedIn && signer) {
      signMessageAndAuthenticate(account, signer)
        .then((jwt) => {
          logIn(jwt);
          hideModal();
        })
        .catch((err) => {
          setErrorCode(err.code);
          setIsConnecting(false);
          return;
        });
    }
  }, [account, hideModal, isConnecting, isLoggedIn, logIn, signer]);

  if (errorCode) {
    const errorMessage = getErrorMessage(errorCode);
    return (
      <StyledWalletSelector>
        <StyledHeader>{errorMessage.heading}</StyledHeader>
        {errorMessage.body}
        <StyledRetryButton onClick={retryConnectWallet}>
          Retry
        </StyledRetryButton>
      </StyledWalletSelector>
    );
  }

  return (
    <StyledWalletSelector>
      <StyledHeader>Connect your wallet</StyledHeader>
      {Object.keys(walletConnectorMap).map((walletName) => {
        return (
          <WalletButton
            key={walletName}
            walletName={walletName}
            activate={activate}
            connector={walletConnectorMap[walletName]}
            enableIsConnectingState={enableIsConnectingState}
            isConnecting={isConnecting}
          />
        );
      })}
    </StyledWalletSelector>
  );
}

const signMessageAndAuthenticate = async (
  address: string,
  signer: JsonRpcSigner
) => {
  console.log('Will log in with address: ', address);
  // Get nonce for wallet address from backend
  // simulate retrieving nonce from backend for now
  const nonce: string = await new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve('testNonceValue');
    }, 500);
  }).catch((err) => {
    // TODO: get error to be handled by error boundary
    throw new Error('Error getting nonce');
  });
  console.log('Retrieved nonce: ', nonce);
  // Request user to sign message so we can authenticate and get jwt from backend
  const jwt: string = await signer
    .signMessage(nonce)
    .then((signature: any) => {
      return new Promise<string>((resolve, reject) => {
        // simulate sending signature in exchange for jwt from backend for now
        setTimeout(() => {
          resolve('testJwt');
        }, 500);
      });
    })
    .catch((err) => {
      err.code = 'REJECTED_SIGNATURE';
      throw err;
    });

  if (!jwt) {
    // TODO: handle error exchanging signature for jwt
    throw new Error('no jwt received from backend');
  }
  return jwt;
};

const StyledWalletSelector = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
`;

const StyledHeader = styled.p`
  color: black;
  font-size: 24px;
`;

const StyledRetryButton = styled.button`
  text-align: center;
  border: 1px solid ${colors.black};
  padding: 10px;
  background: none;
  font-family: inherit;
  margin-top: 20px;
  width: 50%;
  align-self: center;
`;

export default WalletSelector;
