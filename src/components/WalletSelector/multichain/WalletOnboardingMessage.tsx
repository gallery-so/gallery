import { BaseM, BaseXL } from 'components/core/Text/Text';
import styled from 'styled-components';

type Props = {
  title: string;
  description: string;
};

export default function WalletOnboardingMessage({ title, description }: Props) {
  return (
    <div>
      <StyledTitle>{title}</StyledTitle>
      <BaseM>{description}</BaseM>
    </div>
  );
}

const StyledTitle = styled(BaseXL)`
  font-weight: 700;
`;
