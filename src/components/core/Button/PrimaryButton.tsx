import { memo } from 'react';
import styled from 'styled-components';
import { Text } from '../Text/Text';
import colors from '../colors';

type Props = {
  className?: string;
  text: string;
  onClick?: () => void;
};

function PrimaryButton({ className, text, onClick }: Props) {
  return (
    <StyledPrimaryButton className={className} onClick={onClick}>
      <Text color={colors.white}>{text}</Text>
    </StyledPrimaryButton>
  );
}

const StyledPrimaryButton = styled.button`
  border-style: none;
  padding: 12px 16px;

  background: black;
  color: white;

  cursor: pointer;

  text-transform: uppercase;

  transition: opacity 0.2s;
  opacity: 1;
  &:hover {
    opacity: 0.8;
  }
`;

export default memo(PrimaryButton);
