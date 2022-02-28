// Note: These values are the same on purpose! Changing this will require
// re-thinking how the app centers content between nav + footer
export const GLOBAL_NAVBAR_HEIGHT = 80;
export const GLOBAL_FOOTER_HEIGHT = 80;
export const GLOBAL_FOOTER_HEIGHT_MOBILE = 142;

export const fullPageHeightWithoutNavbarAndFooter = `calc(100vh - ${GLOBAL_NAVBAR_HEIGHT}px - ${GLOBAL_FOOTER_HEIGHT}px)`;
