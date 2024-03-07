export const FOOTER_HEIGHT = 56;

export const STEPS = [
  'welcome',
  'add-user-info',
  'add-email',
  'add-username',
  'add-profile-picture',
  'add-persona',
  'recommend-users',
] as const;

export type StepName = (typeof STEPS)[number];

export const ONBOARDING_NEXT_BUTTON_TEXT_MAP: { [key in StepName]: string | null } = {
  welcome: 'Next',
  'add-user-info': 'Next',
  'add-email': null,
  'add-username': 'Next',
  'add-profile-picture': 'Skip',
  'add-persona': 'Skip',
  'recommend-users': 'Skip',
};

export const ONBOARDING_PROGRESS_BAR_STEPS: {
  [key in StepName]: {
    from: number;
    to: number;
  } | null;
} = {
  welcome: null,
  'add-email': {
    from: 0,
    to: 10,
  },
  'add-username': {
    from: 10,
    to: 30,
  },
  'add-profile-picture': {
    from: 30,
    to: 50,
  },
  'add-user-info': {
    from: 50,
    to: 80,
  },
  'add-persona': {
    from: 80,
    to: 90,
  },
  'recommend-users': {
    from: 90,
    to: 95,
  },
};

export function getStepIndex(step: StepName) {
  return STEPS.indexOf(step);
}
