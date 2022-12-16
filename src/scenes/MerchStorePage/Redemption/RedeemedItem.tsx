import styled from 'styled-components';

import CopyToClipboard from '~/components/CopyToClipboard/CopyToClipboard';
import colors from '~/components/core/colors';
import { HStack } from '~/components/core/Spacer/Stack';
import { TitleMonoM } from '~/components/core/Text/Text';
import CopyIcon from '~/icons/CopyIcon';

type Props = {
  name: string;
  discountCode: string;
};

export default function RedeemedItem({ name, discountCode }: Props) {
  return (
    <StyledRedeemItemContainer align="center" justify="space-between">
      <StyledRedeemItemText>{name}</StyledRedeemItemText>
      <HStack gap={16}>
        <TitleMonoM>{discountCode}</TitleMonoM>
        <StyledCopyCodeButton>
          <CopyToClipboard textToCopy={discountCode} successText="Copied.">
            <CopyIcon color={colors.offBlack} />
          </CopyToClipboard>
        </StyledCopyCodeButton>
      </HStack>
    </StyledRedeemItemContainer>
  );
}

const StyledRedeemItemContainer = styled(HStack)`
  padding: 8px 0;
`;

const StyledRedeemItemText = styled(TitleMonoM)`
  color: #000;
`;

const StyledCopyCodeButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  outline: inherit;
`;
