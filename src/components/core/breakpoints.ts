// window sizes when breakpoints kick in
export enum size {
  mobile = '320px',
  tablet = '768px',
  desktop = '1100px',
}

const breakpoints = {
  mobile: `(min-width: ${size.mobile})`,
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
