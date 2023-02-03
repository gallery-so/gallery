export const FOOTER_HEIGHT = 56;

export const STEPS = [
  'welcome',
  'add-user-info',

  // Start New Steps
  'edit-gallery',
  // End New Steps

  // Start Old Steps
  'create',
  'organize-collection',
  'organize-gallery',
  'edit-collection',
  // End Old Steps

  'congratulations',
  'add-email',
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
  'add-email': 'Done',
  'edit-gallery': 'Next',
};

export function getStepIndex(step: StepName) {
  return STEPS.indexOf(step);
}
