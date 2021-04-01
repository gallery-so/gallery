import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { Web3ReactManagerFunctions } from '@web3-react/core/dist/types';
import { injected, walletconnect } from 'connectors/index';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { useCallback } from 'react';
import { useAuthActions } from 'contexts/auth/AuthContext';
import { useModal } from 'contexts/modal/ModalContext';

const walletConnectorMap: Record<string, AbstractConnector> = {
  Metamask: injected,
  WalletConnect: walletconnect,
};

function WalletSelector() {
  const context = useWeb3React<Web3Provider>();
  const {
    connector,
    library,
    chainId,
    account,
    activate,
    deactivate,
    active,
    error,
  } = context;

  const headerMessage = active ? 'Log in with wallet' : 'Connect your wallet';
  let signer;
  if (library && account) {
    signer = library.getSigner(account);
  }

  console.log('library', library);
  return (
    <StyledWalletSelector>
      <StyledHeader>{headerMessage}</StyledHeader>
      {active && account && signer ? (
        <div>
          <div>connected</div>
          <LogInButton address={account} signer={signer}></LogInButton>
        </div>
      ) : (
        Object.keys(walletConnectorMap).map((walletName) => {
          return <WalletButton walletName={walletName} activate={activate} />;
        })
      )}
    </StyledWalletSelector>
  );
}

type WalletButtonProps = {
  walletName: string;
  activate: Web3ReactManagerFunctions['activate'];
};

function WalletButton({ walletName, activate }: WalletButtonProps) {
  const handleClick = useCallback(() => {
    if (walletName.toLowerCase() === 'metamask') {
      injected.isAuthorized().then((isAuthorized: boolean) => {
        console.log('isAuthorized', isAuthorized);
      });
    }
    activate(walletConnectorMap[walletName]);
  }, [activate, walletName]);

  return (
    <StyledButton onClick={handleClick}>
      {walletName}
      <Icon
        src={require(`assets/icons/${walletName.toLowerCase()}.svg`).default}
      />
    </StyledButton>
  );
}

type LogInButtonProps = {
  address: string;
  signer: JsonRpcSigner;
};

function LogInButton({ address, signer }: LogInButtonProps) {
  const { logIn } = useAuthActions();
  const { hideModal } = useModal();
  const handleClick = useCallback(async () => {
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
        // TODO: handle case where user rejects sign request
        throw new Error(err.message);
      });

    if (!jwt) {
      // TODO: handle error exchanging signature for jwt
      throw new Error('no jwt received from backend');
    }
    logIn(jwt);
    hideModal();
  }, [address, hideModal, logIn, signer]);

  return <StyledButton onClick={handleClick}>Log In with wallet</StyledButton>;
}

const StyledWalletSelector = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
`;

const StyledHeader = styled.p`
  color: black;
  font-size: 24px;
`;

const Icon = styled.img`
  width: 24px;
  height: 24px;
  margin: 5px;
`;

const StyledButton = styled.button`
  background: white;
  padding: 16px;
  border: 1px solid black;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 356px;
  margin: 10px 0;
  cursor: pointer;
`;

export default WalletSelector;
