import { useCallback } from 'react';
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
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(index, event.target.checked);
    },
    [index, onChange]
  );

  return (
    <StyledRedeemItemContainer gap={16} align="center">
      <Checkbox
        checked={checked}
        onChange={handleChange}
        label={<StyledRedeemItemText>{name}</StyledRedeemItemText>}
      />
    </StyledRedeemItemContainer>
  );
}

const StyledRedeemItemContainer = styled(HStack)`
  padding: 8px 0;
`;

const StyledRedeemItemText = styled(TitleMonoM)`
  color: #000;
`;
