// DO NOT EDIT THIS FILE WITHOUT ALSO EDITING colors.d.ts right next to this file
// DO NOT EDIT THIS FILE WITHOUT ALSO EDITING colors.d.ts right next to this file
// DO NOT EDIT THIS FILE WITHOUT ALSO EDITING colors.d.ts right next to this file
// DO NOT EDIT THIS FILE WITHOUT ALSO EDITING colors.d.ts right next to this file
// DO NOT EDIT THIS FILE WITHOUT ALSO EDITING colors.d.ts right next to this file

const lightMode = {
  offWhite: '#F9F9F9',
  white: '#FEFEFE',
  black: '#000000',
  offBlack: '#141414',
  black: '#000000',
  graphite: '#2F2F2F',
  shadow: '#707070',
  metal: '#9e9e9e',
  faint: '#f2f2f2',
  porcelain: '#e2e2e2',
  hyperBlue: '#001CC1',
  activeBlue: '#0022F0',
  error: '#FF6666',
  red: '#F00000',
};

// Any code related to dark mode is here exclusively to support the `base` iFrame embed
// This is very hacky and brittle, so if you're updating it, treat it that way.
const darkMode = {
  black: '#FEFEFE',
  offBlack: '#F9F9F9',
  white: '#000000',
  offWhite: '#141414',
  graphite: '#2F2F2F',
  faint: '#707070',
  metal: '#9e9e9e',
  shadow: '#f2f2f2',
  porcelain: '#e2e2e2',
  hyperBlue: '#2563eb',
  activeBlue: '#2563eb',
  error: '#FF6666',
  red: '#F00000',
};

if (isDarkMode()) {
  document.body.style.background = darkMode.white;
  document.body.style.color = darkMode.black;
}

const scheme = isDarkMode() ? darkMode : lightMode;

function isDarkMode() {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.location.pathname === '/base' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

module.exports = scheme;
