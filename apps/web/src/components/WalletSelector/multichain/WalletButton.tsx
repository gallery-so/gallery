import { ButtonHTMLAttributes, useMemo } from 'react';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, BaseS, TitleS } from '~/components/core/Text/Text';
import transitions from '~/components/core/transitions';
import { ChainMetadata } from '~/components/GalleryEditor/PiecesSidebar/chains';
import colors from '~/shared/theme/colors';

export const walletIconMap = {
  metamask: '/icons/metamask.svg',
  walletconnect: '/icons/walletconnect.svg',
  walletlink: '/icons/walletlink.svg',
  gnosis_safe: '/icons/gnosis_safe.svg',
  ethereum: '/icons/ethereum_logo.svg',
  tezos: '/icons/tezos_logo.svg',
  delegate_cash: '/icons/delegate_cash_logo.svg',
};

type WalletButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon?: keyof typeof walletIconMap;
  disabled?: boolean;
  additionalChains?: ChainMetadata[];
};

// takes a list of chain names like ['Zora', 'Optimism'] and converts it to user facing copy like "Including Zora and Optimism"
function convertChainListToSubLabelString(list: string[]) {
  if (list.length === 0) {
    return '';
  } else if (list.length === 1) {
    return `Including ${list[0]}`;
  } else {
    const last = list.pop();
    return `Including ${list.join(', ')} and ${last}`;
  }
}

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

  const subLabel = useMemo(
    () =>
      additionalChains
        ? convertChainListToSubLabelString(additionalChains.map((chain) => chain.name))
        : '',
    [additionalChains]
  );

  return (
    <StyledButton data-testid="wallet-button" disabled={disabled} {...buttonProps}>
      <StyledContent align="center" justify="space-between">
        <VStack align="baseline">
          <TitleS>{label}</TitleS>
          {subLabel && <BaseS color={colors.shadow}>{subLabel}</BaseS>}
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

const StyledButton = styled.button<{
  disabled: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;

  background: ${colors.white};
  border: 1px solid ${({ disabled }) => (disabled ? colors.metal : colors.black['800'])};
  padding: 16px;
  font-size: 16px;
  transition: border-color ${transitions.cubic};

  :enabled {
    cursor: pointer;
    &:hover {
      border-color: ${colors.black['800']};
      background: ${colors.faint};
      ${Icon} {
        transform: scale(1.15);
      }
    }
  }

  ${BaseM} {
    color: ${({ disabled }) => (disabled ? colors.metal : colors.black['800'])};
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

const StyledAdditionalIconContainer = styled.div`
  margin-left: -8px;
  position: relative;
  z-index: 1;
  padding: 2px;
  background: ${colors.white};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledAdditionIcon = styled.img`
  width: 20px;
  height: 20px;
`;

export default WalletButton;
