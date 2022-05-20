export const ANIMATED_COMPONENT_TRANSITION_MS = 300;
export const ANIMATED_COMPONENT_TIMEOUT_MS = 4000;
export const ANIMATED_COMPONENT_TRANSLATION_PIXELS = 10;

const cubic = `${ANIMATED_COMPONENT_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.6, 1)`;

const transitions = {
  cubic,
};

export default transitions;
