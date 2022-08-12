import { ButtonHTMLAttributes } from 'react';
import styled from 'styled-components';
import colors from 'components/core/colors';
import transitions from 'components/core/transitions';

import { BaseM, BODY_FONT_FAMILY } from 'components/core/Text/Text';

const walletIconMap = {
  metamask: '/icons/metamask.svg',
  walletconnect: '/icons/walletconnect.svg',
  walletlink: '/icons/walletlink.svg',
  gnosis_safe: '/icons/gnosis_safe.svg',
  ethereum: '/icons/ethereum_logo.svg',
  tezos: '/icons/tezos_logo.svg',
  solana: '/icons/solana_logo.svg',
};

type WalletButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon: keyof typeof walletIconMap;
};

export const WalletButton = ({ label, icon, ...buttonProps }: WalletButtonProps) => (
  <StyledButton data-testid="wallet-button" {...buttonProps}>
    <BaseM>{label}</BaseM>
    <Icon src={walletIconMap[icon]} />
  </StyledButton>
);

const Icon = styled.img`
  width: 30px;
  height: 30px;
  margin: 5px;

  transform: scale(1);
  transition: transform ${transitions.cubic};
`;

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;

  background: ${colors.white};
  border: 1px solid ${colors.metal};
  padding: 8px 16px;
  margin-bottom: 8px;
  font-size: 16px;
  transition: border-color ${transitions.cubic};

  :disabled {
    ::after {
      color: ${colors.offBlack};
      font-family: ${BODY_FONT_FAMILY};
      font-size: 14px;
      line-height: 20px;

      content: 'Coming soon!';
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.75);
      margin: -1px;
    }
  }

  :enabled {
    cursor: pointer;
    &:hover {
      border-color: ${colors.offBlack};

      ${Icon} {
        transform: scale(1.15);
      }
    }
  }
`;

export default WalletButton;
