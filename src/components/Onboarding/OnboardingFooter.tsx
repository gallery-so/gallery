import {
  ONBOARDING_NEXT_BUTTON_TEXT_MAP,
  getStepIndex,
  StepName,
} from 'components/Onboarding/constants';
import { WizardFooter } from 'components/WizardFooter';

type Props = {
  step: StepName;
  onNext: () => void | Promise<unknown>;
  isNextEnabled: boolean;
  onPrevious: () => void;
};

export function OnboardingFooter({ onNext, onPrevious, step, isNextEnabled }: Props) {
  const stepIndex = getStepIndex(step);
  const isFirstStep = stepIndex === 0;

  const nextButtonText = ONBOARDING_NEXT_BUTTON_TEXT_MAP[step];

  return (
    <WizardFooter
      isNextEnabled={isNextEnabled}
      nextText={nextButtonText}
      previousText={isFirstStep ? 'Cancel' : 'Back'}
      onNext={onNext}
      onPrevious={onPrevious}
    />
  );
}
