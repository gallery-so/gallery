import styled from 'styled-components';

import Checkbox from '~/components/core/Checkbox/Checkbox';
import { HStack } from '~/components/core/Spacer/Stack';
import { TitleMonoM } from '~/components/core/Text/Text';

type Props = {
  name: string;
  checked: boolean;
  index: number;
  onChange: (index: number, checked: boolean) => void;
};

export default function RedeemItem({ checked, index, name, onChange }: Props) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.checked);
    onChange(index, event.target.checked);
  };

  return (
    <StyledRedeemItemContainer gap={16} align="center">
      <Checkbox checked={checked} onChange={handleChange} />
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
