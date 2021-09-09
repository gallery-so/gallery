import { useWizardValidationState } from './WizardValidationContext';

export default function useIsNextEnabled() {
  const wizardValidationState = useWizardValidationState();
  return Boolean(wizardValidationState.isNextEnabled);
}
