import styled from 'styled-components';
import { BaseM, TitleS } from 'components/core/Text/Text';
import { Button } from 'components/core/Button/Button';
import Markdown from 'components/core/Markdown/Markdown';
import { VStack } from 'components/core/Spacer/Stack';

type Props = {
  heading: string;
  body: string;
  reset: () => void;
};

export const WalletSelectorError = ({ heading, body, reset }: Props) => (
  <VStack gap={16}>
    <TitleS>{heading}</TitleS>
    <VStack>
      <StyledBody>
        <Markdown text={body} />
      </StyledBody>
      <StyledRetryButton onClick={reset}>Try Another Wallet</StyledRetryButton>
    </VStack>
  </VStack>
);

const StyledBody = styled(BaseM)`
  margin-bottom: 30px;
  white-space: pre-wrap;
`;

const StyledRetryButton = styled(Button)`
  width: 200px;
  align-self: center;
`;
