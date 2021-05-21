// Gallery uses mobile-first styling. Styles should be applied with mobile as default,
// and progressively add styles for larger breakpoints.

// Our breakpoints are as follows:
// mobile:      0px   - 419px;
// mobileLarge: 420px - 767px;
// tablet:      768px - 1099px;
// desktop:     1100px - ;

// window sizes when breakpoints kick in
export enum size {
  mobile = 0,
  mobileLarge = 420,
  tablet = 768,
  desktop = 1100,
}

const breakpoints = {
  mobileLarge: `(min-width: ${size.mobileLarge}px)`,
  tablet: `(min-width: ${size.tablet}px)`,
  desktop: `(min-width: ${size.desktop}px)`,
};

// how wide the inner content should be
export enum contentSize {
  mobile = 0, // todo
  tablet = 1, // todo
  desktop = 1024,
}

export enum pageGutter {
  mobile = 16,
  tablet = 32,
}

export default breakpoints;
