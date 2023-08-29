export const FOOTER_HEIGHT = 56;

export const STEPS = ['welcome', 'add-user-info', 'add-email'] as const;

export type StepName = (typeof STEPS)[number];

export const ONBOARDING_NEXT_BUTTON_TEXT_MAP: { [key in StepName]: string } = {
  welcome: 'Next',
  'add-user-info': 'Next',
  'add-email': 'Done',
};

export function getStepIndex(step: StepName) {
  return STEPS.indexOf(step);
}
