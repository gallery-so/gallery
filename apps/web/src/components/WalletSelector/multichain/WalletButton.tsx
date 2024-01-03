import { ButtonHTMLAttributes, useMemo } from 'react';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleS } from '~/components/core/Text/Text';
import transitions from '~/components/core/transitions';
import colors from '~/shared/theme/colors';
import { ChainMetadata } from '~/shared/utils/chains';

export const walletIconMap = {
  metamask: '/icons/metamask.svg',
  walletconnect: '/icons/walletconnect.svg',
  walletlink: '/icons/walletlink.svg',
  gnosis_safe: '/icons/gnosis_safe.svg',
  ethereum: '/icons/ethereum_logo.svg',
  tezos: '/icons/tezos_logo.svg',
  delegate_cash: '/icons/delegate_cash_logo.svg',
  solana: '/icons/solana_logo.svg',
};

type WalletButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon?: keyof typeof walletIconMap;
  disabled?: boolean;
  additionalChains?: ChainMetadata[];
};

export const WalletButton = ({
  label,
  additionalChains,
  icon,
  disabled = false,
  ...buttonProps
}: WalletButtonProps) => {
  const additionalIcons = useMemo(
    () => (additionalChains ? additionalChains.map((chain) => chain.icon) : []),
    [additionalChains]
  );

  return (
    // don't actually disable the button, otherwise onClick won't fire. we only need the button to appear disabled.
    <StyledButton data-testid="wallet-button" visuallyDisable={disabled} {...buttonProps}>
      <StyledContent align="center" justify="space-between">
        <VStack align="baseline">
          <TitleS color={disabled ? colors.metal : colors.black['800']}>{label}</TitleS>
        </VStack>
        <StyledButtonIcon>
          {disabled && <StyledComingSoonText>COMING SOON</StyledComingSoonText>}
          <HStack gap={4}>
            {additionalIcons.map((additionalIcon) => (
              <StyledAdditionalIconContainer key={additionalIcon}>
                <StyledAdditionIcon src={additionalIcon} />
              </StyledAdditionalIconContainer>
            ))}
            {icon && <Icon src={walletIconMap[icon]} />}
          </HStack>
        </StyledButtonIcon>
      </StyledContent>
    </StyledButton>
  );
};

const Icon = styled.img`
  width: 24px;
  height: 24px;

  transform: scale(1);
  transition: transform ${transitions.cubic};
`;

const StyledContent = styled(HStack)`
  width: 100%;
`;

const StyledAdditionalIconContainer = styled.div`
  margin-left: -12px;
  position: relative;
  z-index: 1;
  padding: 2px;
  background: ${colors.white};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledButton = styled.button<{
  visuallyDisable: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;

  background: ${colors.white};
  border: 1px solid
    ${({ visuallyDisable }) => (visuallyDisable ? colors.metal : colors.black['800'])};
  padding: 16px;
  font-size: 16px;
  transition: border-color ${transitions.cubic};

  ${({ visuallyDisable }) =>
    !visuallyDisable &&
    `  :enabled {
      cursor: pointer;
      &:hover {
        border-color: ${colors.black['800']};
        background: ${colors.faint};
  
        ${StyledAdditionalIconContainer} {
          background: ${colors.faint};
        }
      }
    }`}

  ${BaseM} {
    color: ${({ visuallyDisable }) => (visuallyDisable ? colors.metal : colors.black['800'])};
  }

  ${Icon} {
    filter: ${({ visuallyDisable }) => (visuallyDisable ? `grayscale(1)` : `grayscale(0)`)};
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

const StyledAdditionIcon = styled.img`
  width: 20px;
  height: 20px;
`;

export default WalletButton;
