import { useCallback, useState } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import colors from '~/components/core/colors';
import IconContainer from '~/components/core/IconContainer';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { Spinner } from '~/components/core/Spinner/Spinner';
import { BaseXL, BODY_FONT_FAMILY } from '~/components/core/Text/Text';
import {
  GLOBAL_FOOTER_HEIGHT,
  GLOBAL_FOOTER_HEIGHT_MOBILE,
} from '~/contexts/globalLayout/GlobalFooter/GlobalFooter';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { QuestionMarkIcon } from '~/icons/QuestionMarkIcon';

import BrainModal, { LogType } from './BrainModal';
import PromptSuggestion from './PromptSuggestion';

export default function BrainPage() {
  // Who has the most token for this contract - 27rgMOEBjoRerVjgAwC1Elz1mKG?
  //   how many tokens that user with username kaito has?
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resultText, setResultText] = useState<string>('');
  const [logs, setLogs] = useState<LogType[]>([]);

  const { showModal } = useModalActions();

  const handleSearch = useCallback(async () => {
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
      setResultText('');
      setLogs([]);
      const response = await fetch('/api/ask', payload);
      const data = await response.json();

      setResultText(data.output.output);
      setLogs(data.output.intermediateSteps);
    } catch (error) {
      console.error(error);
      setResultText('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  const handleShowLog = useCallback(() => {
    showModal({
      content: <BrainModal logs={logs} />,
    });
  }, [logs, showModal]);

  return (
    <StyledMaintenancePage gap={24}>
      <StyledContainer gap={32}>
        <StyledLogo src="/icons/logo-large.svg" />

        <VStack gap={16}>
          <StyledTextArea
            rows={2}
            cols={50}
            autoComplete="off"
            autoCorrect="off"
            placeholder="Search for anything..."
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            disabled={isLoading}
          />
          <Button onClick={handleSearch} disabled={isLoading || !prompt}>
            {isLoading ? <Spinner /> : 'Ask'}
          </Button>
        </VStack>

        <PromptSuggestion
          onSelect={(selectedPrompt) => {
            setPrompt(selectedPrompt);
          }}
        />

        {resultText && (
          <VStack gap={8}>
            <HStack justify="flex-end">
              <StyledIconContainer
                onClick={handleShowLog}
                variant="blue"
                size="sm"
                icon={<QuestionMarkIcon />}
              />
            </HStack>
            <BaseXL>{resultText}</BaseXL>
          </VStack>
        )}
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
  max-width: 100%;
`;

const StyledTextArea = styled.textarea`
  border: none;
  padding: 16px;

  font-size: 16px;
  line-height: 24px;
  color: ${colors.offBlack};
  caret-color: ${colors.offBlack};

  font-family: ${BODY_FONT_FAMILY};
  border: none;
  border-bottom: 36px solid transparent;
  resize: none;
  background: ${colors.offWhite};
  color: ${colors.offBlack};

  &::placeholder {
    color: ${colors.offBlack};
  }
`;

const StyledIconContainer = styled(IconContainer)`
  background-color: ${colors.offBlack};
  cursor: pointer;

  &:hover {
    background-color: ${colors.metal};
  }
`;
