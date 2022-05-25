export const ANIMATED_COMPONENT_TRANSITION_MS = 300;
export const ANIMATED_COMPONENT_TIMEOUT_MS = 4000;
// translation for larger items like modals, popovers
export const ANIMATED_COMPONENT_TRANSLATION_PIXELS_LARGE = 16;
// translation for smaller items like tooltips
export const ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL = 8;

const cubic = `${ANIMATED_COMPONENT_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.6, 1)`;

const transitions = {
  cubic,
};

export default transitions;
