import styled from 'styled-components';
import { BaseM, BaseXL } from 'components/core/Text/Text';
import { Button } from 'components/core/Button/Button';
import Markdown from 'components/core/Markdown/Markdown';
import { VStack } from 'components/core/Spacer/Stack';

type Props = {
  heading: string;
  body: string;
  reset: () => void;
};

export const WalletSelectorError = ({ heading, body, reset }: Props) => (
  <VStack gap={30}>
    <VStack>
      <StyledTitle>{heading}</StyledTitle>
      <StyledBody>
        <Markdown text={body} />
      </StyledBody>
    </VStack>
    <StyledRetryButton onClick={reset}>Try Another Wallet</StyledRetryButton>
  </VStack>
);

const StyledTitle = styled(BaseXL)`
  font-weight: 700;
`;

const StyledBody = styled(BaseM)`
  white-space: pre-wrap;
`;

const StyledRetryButton = styled(Button)`
  width: 200px;
  align-self: center;
`;
