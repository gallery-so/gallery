// DO NOT EDIT THIS FILE WITHOUT ALSO EDITING colors.js right next to this file
// DO NOT EDIT THIS FILE WITHOUT ALSO EDITING colors.js right next to this file
// DO NOT EDIT THIS FILE WITHOUT ALSO EDITING colors.js right next to this file
// DO NOT EDIT THIS FILE WITHOUT ALSO EDITING colors.js right next to this file
// DO NOT EDIT THIS FILE WITHOUT ALSO EDITING colors.js right next to this file

declare const colors: {
  offWhite: '#F9F9F9';
  white: '#FEFEFE';
  offBlack: '#141414';
  black: {
    DEFAULT: '#000000';
    500: '#303030';
    600: '#2A2A2A';
    700: '#202020';
    800: '#141414';
    900: '#0C0C0C';
  };
  shadow: '#707070';
  metal: '#9e9e9e';
  porcelain: '#e2e2e2';
  faint: '#f2f2f2';
  hyperBlue: '#001CC1';
  activeBlue: '#0022F0';
  error: '#FF6666';
  red: '#F00000';
};

type FlattenColors<T> = T extends string ? T : T extends Record<string, infer U> ? U : never;

type AllColorValues = (typeof colors)[keyof typeof colors];

export type ColorType = FlattenColors<AllColorValues>;

export default colors;
