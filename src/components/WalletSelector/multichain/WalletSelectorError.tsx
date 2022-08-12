import styled from 'styled-components';
import { BaseM, TitleS } from 'components/core/Text/Text';
import { Button } from 'components/core/Button/Button';
import Spacer from 'components/core/Spacer/Spacer';
import Markdown from 'components/core/Markdown/Markdown';

type Props = {
  heading: string;
  body: string;
  reset: () => void;
};

export const WalletSelectorError = ({ heading, body, reset }: Props) => (
  <>
    <TitleS>{heading}</TitleS>
    <Spacer height={16} />
    <StyledBody>
      <Markdown text={body} />
    </StyledBody>
    <StyledRetryButton onClick={reset}>Try Another Wallet</StyledRetryButton>
  </>
);

const StyledBody = styled(BaseM)`
  margin-bottom: 30px;
  white-space: pre-wrap;
`;

const StyledRetryButton = styled(Button)`
  width: 200px;
  align-self: center;
`;
