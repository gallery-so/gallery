// All styles should be applied mobile first

// window sizes when breakpoints kick in
export enum size {
  mobileLarge = '420px',
  tablet = '768px',
  desktop = '1100px',
}

const breakpoints = {
  mobileLarge: `(min-width: ${size.mobileLarge})`,
  tablet: `(min-width: ${size.tablet})`,
  desktop: `(min-width: ${size.desktop})`,
};

// how wide the inner content should be
export enum contentSize {
  mobile = 'TODO',
  tablet = 'TODO',
  desktop = '1024px',
}

export default breakpoints;
