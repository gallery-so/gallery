import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { injected, walletconnect, walletlink } from 'connectors/index';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthActions } from 'contexts/auth/AuthContext';
import useIsAuthenticated from 'contexts/auth/useIsAuthenticated';
import WalletButton from './WalletButton';
import colors from 'components/core/colors';
import { Text } from 'components/core/Text/Text';
import Button from 'components/core/Button/Button';
import { navigate } from '@reach/router';

const walletConnectorMap: Record<string, AbstractConnector> = {
  Metamask: injected,
  WalletConnect: walletconnect,
  WalletLink: walletlink,
};

type ErrorMessage = {
  heading: string;
  body: string;
};

const ERROR_MESSAGES: { [key: string]: ErrorMessage } = {
  REJECTED_SIGNATURE: {
    heading: 'Account access needed',
    body: 'Please sign with your wallet to access your account.',
  },
  UNKNOWN_ERROR: {
    heading: 'There was an error connecting',
    body: 'Please try again.',
  },
};

function getErrorMessage(errorCode: string) {
  return ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.UNKNOWN_ERROR;
}

function WalletSelector() {
  const isAuthenticated = useIsAuthenticated();
  const {
    library,
    account,
    activate,
    deactivate,
    active,
  } = useWeb3React<Web3Provider>();

  const [pendingWallet, setPendingWallet] = useState<
    AbstractConnector | undefined
  >();
  const [isPending, setIsPending] = useState(false);
  const [errorCode, setErrorCode] = useState('');

  const setToPendingState = useCallback((connector: AbstractConnector) => {
    setIsPending(true);
    setPendingWallet(connector);
  }, []);

  const retryConnectWallet = useCallback(() => {
    setIsPending(false);
    setErrorCode('');
    deactivate();
  }, [deactivate]);

  const signer = useMemo(() => {
    return library && account ? library.getSigner(account) : undefined;
  }, [library, account]);

  const { logIn } = useAuthActions();

  useEffect(() => {
    if (account && isPending && signer) {
      signMessageAndAuthenticate(account, signer)
        .then((jwt) => {
          logIn(jwt);
          navigate('/welcome');
        })
        .catch((err) => {
          setErrorCode(err.code);
          setIsPending(false);
          return;
        });
    }
  }, [account, isPending, isAuthenticated, logIn, signer]);

  if (errorCode) {
    const errorMessage = getErrorMessage(errorCode);
    return (
      <StyledWalletSelector>
        <StyledHeader>{errorMessage.heading}</StyledHeader>
        <StyledBody>{errorMessage.body}</StyledBody>
        <StyledRetryButton onClick={retryConnectWallet} text="Retry" />
      </StyledWalletSelector>
    );
  }

  return (
    <StyledWalletSelector>
      <StyledHeader>Connect your wallet</StyledHeader>
      {isPending ? (
        <WalletButton
          activate={activate}
          connector={pendingWallet}
          setToPendingState={setToPendingState}
          isPending={isPending}
        />
      ) : (
        Object.keys(walletConnectorMap).map((walletName) => {
          return (
            <WalletButton
              key={walletName}
              walletName={walletName}
              activate={activate}
              connector={walletConnectorMap[walletName]}
              setToPendingState={setToPendingState}
              isPending={isPending}
            />
          );
        })
      )}
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

const StyledHeader = styled(Text)`
  color: ${colors.black};
  font-weight: 500;
  line-height: initial;
  font-size: 18px;

  margin-bottom: 16px;
`;

const StyledBody = styled(Text)`
  color: ${colors.gray50};
  margin-bottom: 30px;
`;

const StyledRetryButton = styled(Button)`
  width: 50%;
  align-self: center;
`;

export default WalletSelector;
