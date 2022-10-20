export const FOOTER_HEIGHT = 56;

export const STEPS = [
  'welcome',
  'add-user-info',
  'create',
  'organize-collection',
  'organize-gallery',
  'edit-collection',
  'congratulations',
] as const;

export type StepName = typeof STEPS[number];

export const ONBOARDING_NEXT_BUTTON_TEXT_MAP: { [key in StepName]: string } = {
  welcome: 'Next',
  'add-user-info': 'Next',
  create: 'New Collection',
  'organize-collection': 'Continue',
  'edit-collection': 'Save',
  'organize-gallery': 'Publish Gallery',
  congratulations: 'Done',
};

export function getStepIndex(step: StepName) {
  return STEPS.indexOf(step);
}

export function getStepUrl(step: StepName) {
  return `/onboarding/${step}`;
}
