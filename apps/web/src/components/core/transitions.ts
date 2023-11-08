export const ANIMATED_COMPONENT_TRANSITION_MS = 300;
export const ANIMATED_COMPONENT_TRANSITION_S = 0.3;
export const ANIMATED_COMPONENT_TRANSITION_LONG_S = 3;

export const ANIMATED_COMPONENT_TIMEOUT_MS = 4000;
export const ANIMATED_COMPONENT_TIMEOUT_S = 4;

// translation for larger items like modals, popovers
export const ANIMATED_COMPONENT_TRANSLATION_PIXELS_LARGE = 16;
// translation for smaller items like tooltips
export const ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL = 8;

const cubicValues = [0.4, 0, 0.6, 1];
const cubic = `${ANIMATED_COMPONENT_TRANSITION_MS}ms cubic-bezier(${cubicValues.join(', ')})`;
const pulse = `${ANIMATED_COMPONENT_TRANSITION_LONG_S}s  cubic-bezier(${cubicValues.join(', ')})`;

export const rawTransitions = {
  cubicValues,
};

const transitions = {
  cubic,
  pulse,
};

export default transitions;
