import { ButtonHTMLAttributes } from 'react';
import styled from 'styled-components';
import colors from 'components/core/colors';
import transitions from 'components/core/transitions';
import { BaseM } from 'components/core/Text/Text';

export const walletIconMap = {
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
  disabled?: boolean;
};

export const WalletButton = ({
  label,
  icon,
  disabled = false,
  ...buttonProps
}: WalletButtonProps) => (
  <StyledButton data-testid="wallet-button" disabled={disabled} {...buttonProps}>
    <BaseM>{label}</BaseM>
    <StyledButtonIcon>
      {disabled && <StyledComingSoonText>COMING SOON</StyledComingSoonText>}
      <Icon src={walletIconMap[icon]} />
    </StyledButtonIcon>
  </StyledButton>
);

const Icon = styled.img`
  width: 24px;
  height: 24px;
  margin: 5px;

  transform: scale(1);
  transition: transform ${transitions.cubic};
`;

const StyledButton = styled.button<{
  disabled: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;

  background: ${colors.white};
  border: 1px solid ${({ disabled }) => (disabled ? colors.metal : colors.offBlack)};
  padding: 8px 16px;
  font-size: 16px;
  transition: border-color ${transitions.cubic};

  :enabled {
    cursor: pointer;
    &:hover {
      border-color: ${colors.offBlack};

      ${Icon} {
        transform: scale(1.15);
      }
    }
  }

  ${BaseM} {
    color: ${({ disabled }) => (disabled ? colors.metal : colors.offBlack)};
  }

  ${Icon} {
    filter: ${({ disabled }) => (disabled ? `grayscale(1)` : `grayscale(0)`)};
  }
`;

const StyledButtonIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledComingSoonText = styled(BaseM)`
  color: ${colors.metal};
  margin-right: 24px;
`;

export default WalletButton;
