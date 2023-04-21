import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { ClickablePill } from '~/components/Pill';

const EXAMPLE_PROMPTS = [
  'Give me top 5 users most view',
  'who has the most nft?',
  'Who has the most nft for this contract 27rgMOEBjoRerVjgAwC1Elz1mKG?',
  'Which user has the most followers? use the follows table to check',
  'how many token that username robin has?',
];

type Props = {
  onSelect: (prompt: string) => void;
};

export default function PromptSuggestion({ onSelect }: Props) {
  return (
    <StyledPromptSuggestion gap={8} justify="flex-start">
      {EXAMPLE_PROMPTS.map((prompt, index) => (
        <ClickablePill key={index} onClick={() => onSelect(prompt)}>
          {prompt}
        </ClickablePill>
      ))}
    </StyledPromptSuggestion>
  );
}

const StyledPromptSuggestion = styled(VStack)``;
