import styled from 'styled-components';

import { Button } from '../core/Button/Button';
import colors from '../core/colors';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM, BODY_MONO_FONT_FAMILY, TitleDiatypeM } from '../core/Text/Text';
import { NewTooltip } from '../Tooltip/NewTooltip';
import { useTooltipHover } from '../Tooltip/useTooltipHover';
import { walletIconMap } from '../WalletSelector/multichain/WalletButton';

type PrimaryWalletProps = {
  address: string | null;
  chain: string;
};

export default function PrimaryWalletRow({ address, chain }: PrimaryWalletProps) {
  const iconUrl = walletIconMap[chain.toLowerCase() as keyof typeof walletIconMap];

  const { floating, reference, getFloatingProps, getReferenceProps, floatingStyle } =
    useTooltipHover();

  return (
    <PrimaryWallet gap={12}>
      <TitleDiatypeM>Primary</TitleDiatypeM>
      <HStack align="center" justify="space-between">
        <HStack gap={12} align="center">
          <Icon src={iconUrl} />
          <StyledWalletAddress>{address}</StyledWalletAddress>
        </HStack>
        <div {...getReferenceProps()} ref={reference}>
          <StyledButton variant="warning" disabled>
            Disconnect
          </StyledButton>
        </div>
        <NewTooltip
          {...getFloatingProps()}
          style={floatingStyle}
          ref={floating}
          text="To disconnect your primary wallet, please select another wallet as the primary first."
        />
      </HStack>
    </PrimaryWallet>
  );
}

const Icon = styled.img`
  width: 16px;
  height: 16px;
`;

const PrimaryWallet = styled(VStack)`
  background-color: ${colors.offWhite};
  padding: 12px;
`;

const StyledWalletAddress = styled(BaseM)`
  font-family: ${BODY_MONO_FONT_FAMILY};
`;

const StyledButton = styled(Button)`
  padding: 8px 12px;
`;
