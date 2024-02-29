import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { graphql } from 'react-relay';
import { usePromisifiedMutation } from 'shared/relay/usePromisifiedMutation';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeM } from '~/components/core/Text/Text';
import FullPageCenteredStep from '~/components/Onboarding/FullPageCenteredStep';
import { OnboardingFooter } from '~/components/Onboarding/OnboardingFooter';
import {
  OnboardingAddPersonaPageMutation,
  Persona,
} from '~/generated/OnboardingAddPersonaPageMutation.graphql';

const PERSONAS = ['Collector', 'Creator', 'Both'] as Persona[];
const onboardingStepName = 'add-persona';
export function OnboardingAddPersonaPage() {
  const [setPersona] = usePromisifiedMutation<OnboardingAddPersonaPageMutation>(graphql`
    mutation OnboardingAddPersonaPageMutation($input: Persona!) @raw_response_type {
      setPersona(persona: $input) {
        ... on SetPersonaPayload {
          __typename
        }
      }
    }
  `);

  const { push } = useRouter();

  const handlePersonaClick = useCallback(
    (persona: Persona) => {
      setPersona({
        variables: {
          input: persona,
        },
      });

      push('/onboarding/recommend-users');
    },
    [push, setPersona]
  );

  const handleSkip = useCallback(() => {
    handlePersonaClick('None');
    push('/onboarding/recommend-users');
  }, [handlePersonaClick, push]);

  const handlePrevious = useCallback(() => {
    push('/onboarding/add-user-info');
  }, [push]);

  return (
    <VStack>
      <FullPageCenteredStep stepName={onboardingStepName}>
        <Container gap={16}>
          <TitleDiatypeM>What best describes you?</TitleDiatypeM>
          {PERSONAS.map((persona) => (
            <Row onClick={() => handlePersonaClick(persona)} key={persona}>
              <BaseM>{persona}</BaseM>
            </Row>
          ))}
        </Container>
      </FullPageCenteredStep>
      <OnboardingFooter
        step={onboardingStepName}
        onNext={handleSkip}
        isNextEnabled
        nextButtonVariant="secondary"
        previousTextOverride="Back"
        onPrevious={handlePrevious}
      />
    </VStack>
  );
}

const Container = styled(VStack)`
  width: 480px;
`;

const Row = styled.button`
  padding: 16px;
  border: 1px solid ${colors.black[800]};
  text-align: left;
  background-color: ${colors.white};
  cursor: pointer;
`;
