import { Web3ReactManagerFunctions } from '@web3-react/core/dist/types';
import { injected } from 'connectors/index';
import { useCallback } from 'react';
import styled from 'styled-components';

type WalletButtonProps = {
  walletName: string;
  activate: Web3ReactManagerFunctions['activate'];
  connector: any;
};

function WalletButton({ walletName, activate, connector }: WalletButtonProps) {
  const handleClick = useCallback(() => {
    if (walletName.toLowerCase() === 'metamask') {
      injected.isAuthorized().then((isAuthorized: boolean) => {
        console.log('isAuthorized', isAuthorized);
      });
    }
    activate(connector);
  }, [activate, connector, walletName]);

  return (
    <StyledButton onClick={handleClick}>
      {walletName}
      <Icon
        src={require(`assets/icons/${walletName.toLowerCase()}.svg`).default}
      />
    </StyledButton>
  );
}

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
export default WalletButton;
