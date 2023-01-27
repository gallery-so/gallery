import styled from 'styled-components';

import colors from '../core/colors';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM, BaseS, BODY_MONO_FONT_FAMILY, TitleXS } from '../core/Text/Text';
import { walletIconMap } from '../WalletSelector/multichain/WalletButton';

type PrimaryWalletProps = {
  address: string | null;
  chain: string;
};

export default function PrimaryWalletRow({ address, chain }: PrimaryWalletProps) {
  const iconUrl = walletIconMap[chain.toLowerCase() as keyof typeof walletIconMap];

  return (
    <PrimaryWallet gap={10}>
      <HStack align="center" justify="space-between">
        <HStack gap={4} align="center">
          <Icon src={iconUrl} />
          <StyledWalletAddress>{address}</StyledWalletAddress>
        </HStack>
        <BlueBox>
          <TitleXS color={colors.activeBlue}>Primary</TitleXS>
        </BlueBox>
      </HStack>
      <BaseS>Disconnecting? First, set another wallet as your primary.</BaseS>
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

const BlueBox = styled.div`
  padding: 2px 4px;
  border: 1px solid ${colors.activeBlue};
  border-radius: 2px;
`;
