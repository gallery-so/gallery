// Gallery uses mobile-first styling. Styles should be applied with mobile as default,
// and progressively add styles for larger breakpoints.

// Our breakpoints are as follows:
// mobile:      0px   - 374px;
// mobileLarge: 375px - 767px;
// tablet:      768px - 1099px;
// desktop:     1100px - ;

// window sizes when breakpoints kick in
export enum size {
  mobileLarge = '375px',
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

export enum pageGutter {
  mobile = '16px',
  tablet = '32px',
}

export default breakpoints;
