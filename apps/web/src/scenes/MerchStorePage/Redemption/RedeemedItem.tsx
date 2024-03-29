import styled from 'styled-components';

import CopyToClipboard from '~/components/CopyToClipboard/CopyToClipboard';
import { HStack } from '~/components/core/Spacer/Stack';
import { TitleMonoM } from '~/components/core/Text/Text';
import CopyIcon from '~/icons/CopyIcon';
import colors from '~/shared/theme/colors';

import { REDEEMED_STATUS } from '../constants';

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
        {discountCode === REDEEMED_STATUS ? null : (
          <StyledCopyCodeButton>
            <CopyToClipboard textToCopy={discountCode} successText="Copied.">
              <CopyIcon color={colors.black['800']} />
            </CopyToClipboard>
          </StyledCopyCodeButton>
        )}
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
