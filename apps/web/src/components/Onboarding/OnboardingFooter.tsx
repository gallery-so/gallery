import {
  getStepIndex,
  ONBOARDING_NEXT_BUTTON_TEXT_MAP,
  StepName,
} from '~/components/Onboarding/constants';
import { WizardFooter } from '~/components/WizardFooter';

type Props = {
  step: StepName;
  onNext: () => void | Promise<unknown>;
  isNextEnabled: boolean;
  onPrevious: () => void;
  previousTextOverride?: string;
};

export function OnboardingFooter({
  onNext,
  onPrevious,
  step,
  isNextEnabled,
  previousTextOverride,
}: Props) {
  const stepIndex = getStepIndex(step);
  const isFirstStep = stepIndex === 0;

  const nextButtonText = ONBOARDING_NEXT_BUTTON_TEXT_MAP[step];

  return (
    <WizardFooter
      step={step}
      isNextEnabled={isNextEnabled}
      nextText={nextButtonText}
      previousText={previousTextOverride || (isFirstStep ? 'Cancel' : 'Back')}
      onNext={onNext}
      onPrevious={onPrevious}
    />
  );
}
