import {
  getStepIndex,
  ONBOARDING_NEXT_BUTTON_TEXT_MAP,
  StepName,
} from '~/components/Onboarding/constants';
import { WizardFooter } from '~/components/WizardFooter';

import { ButtonProps } from '../core/Button/Button';

type Props = {
  step: StepName;
  onNext?: () => void | Promise<unknown>;
  isNextEnabled: boolean;
  nextButtonVariant?: ButtonProps['variant'];

  onPrevious?: () => void;
  previousTextOverride?: string;
};

export function OnboardingFooter({
  onNext,
  onPrevious,
  step,
  isNextEnabled,
  previousTextOverride,
  nextButtonVariant,
}: Props) {
  const stepIndex = getStepIndex(step);
  const isFirstStep = stepIndex === 0;

  const nextButtonText = ONBOARDING_NEXT_BUTTON_TEXT_MAP[step];

  return (
    <WizardFooter
      step={step}
      isNextEnabled={isNextEnabled}
      nextText={nextButtonText}
      previousText={isFirstStep ? 'Cancel' : previousTextOverride}
      onNext={onNext}
      onPrevious={onPrevious}
      nextButtonVariant={nextButtonVariant}
    />
  );
}
