import { useCallback, useState } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import colors from '~/components/core/colors';
import { VStack } from '~/components/core/Spacer/Stack';
import { Spinner } from '~/components/core/Spinner/Spinner';
import { BaseM } from '~/components/core/Text/Text';
import {
  GLOBAL_FOOTER_HEIGHT,
  GLOBAL_FOOTER_HEIGHT_MOBILE,
} from '~/contexts/globalLayout/GlobalFooter/GlobalFooter';

export default function BrainPage() {
  // Who has the most token for this contract - 27rgMOEBjoRerVjgAwC1Elz1mKG?
  //   how many tokens that user with username kaito has?
  const [prompt, setPrompt] = useState<string>(
    'Which user has the most followers? use the follows table to check'
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resultText, setResultText] = useState<string>('');
  const [log, setLogs] = useState<any[]>([]);

  const handleSearch = useCallback(async () => {
    console.log(`click`);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    const body = JSON.stringify({
      prompt,
    });

    const payload = {
      method: 'POST',
      headers,
      body,
    };

    try {
      setIsLoading(true);
      const response = await fetch('/api/hello', payload);
      const data = await response.json();
      console.log(data);

      setResultText(data.output.output);
      setLogs(data.output.intermediateSteps);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  return (
    <StyledMaintenancePage gap={24}>
      <StyledContainer gap={16}>
        <StyledLogo src="/icons/logo-large.svg" />

        <VStack gap={8}>
          <StyledTextArea
            rows={4}
            cols={50}
            autoComplete="off"
            autoCorrect="off"
            placeholder="Search for anything..."
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            disabled={isLoading}
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? <Spinner /> : 'Search'}
          </Button>
        </VStack>

        {resultText && <BaseM>{resultText}</BaseM>}
      </StyledContainer>
    </StyledMaintenancePage>
  );
}

const StyledLogo = styled.img`
  height: 32px;
`;

const StyledMaintenancePage = styled(VStack)`
  justify-content: center;
  align-items: center;

  padding-top: ${GLOBAL_FOOTER_HEIGHT_MOBILE}px;
  height: calc(100vh - ${GLOBAL_FOOTER_HEIGHT_MOBILE}px);

  @media only screen and ${breakpoints.mobileLarge} {
    padding-top: ${GLOBAL_FOOTER_HEIGHT}px;
    height: calc(100vh - ${GLOBAL_FOOTER_HEIGHT}px);
  }
`;

const StyledContainer = styled(VStack)`
  width: 500px;
`;

const StyledTextArea = styled.textarea`
  width: 100%;

  border: none;
  padding: 16px;

  font-size: 16px;
  line-height: 24px;
  color: ${colors.offBlack};
  caret-color: ${colors.offBlack};

  &::placeholder {
    color: ${colors.porcelain};
  }
`;
