export const FOOTER_HEIGHT = 56;

export const STEPS = [
  'welcome',
  'add-user-info',
  'add-email',
  'add-username',
  'add-profile-picture',
  'add-persona',
] as const;

export type StepName = (typeof STEPS)[number];

export const ONBOARDING_NEXT_BUTTON_TEXT_MAP: { [key in StepName]: string | null } = {
  welcome: 'Next',
  'add-user-info': 'Next',
  'add-email': null,
  'add-username': 'Next',
  'add-profile-picture': 'Finish',
  'add-persona': 'Skip',
};

export function getStepIndex(step: StepName) {
  return STEPS.indexOf(step);
}
