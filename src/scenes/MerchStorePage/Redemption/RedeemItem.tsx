import styled from 'styled-components';

import Checkbox from '~/components/core/Checkbox/Checkbox';
import { HStack } from '~/components/core/Spacer/Stack';
import { TitleMonoM } from '~/components/core/Text/Text';
import noop from '~/utils/noop';

type Props = {
  name: string;
  checked: boolean;
};

export default function RedeemItem({ checked, name }: Props) {
  return (
    <StyledRedeemItemContainer gap={16} align="center">
      <Checkbox checked={checked} onChange={noop} />
      <StyledRedeemItemText>{name}</StyledRedeemItemText>
    </StyledRedeemItemContainer>
  );
}

const StyledRedeemItemContainer = styled(HStack)`
  padding: 8px 0;
`;

const StyledRedeemItemText = styled(TitleMonoM)`
  color: #000;
`;
