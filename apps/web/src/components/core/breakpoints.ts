// Gallery uses mobile-first styling. Styles should be applied with mobile as default,
// and progressively add styles for larger breakpoints.

// Our breakpoints are as follows:
// mobile:      0px   - 430px;
// mobileLarge: 431px - 767px;
// tablet:      768px - 1099px;
// desktop:     1100px - ;

// window sizes when breakpoints kick in
export enum size {
  mobile = 0,
  mobileLarge = 460, // galaxy s22
  tablet = 768,
  desktop = 1100,
}

const breakpoints = {
  mobile: `(min-width: ${size.mobile}px)`,
  mobileLarge: `(min-width: ${size.mobileLarge}px)`,
  tablet: `(min-width: ${size.tablet}px)`,
  desktop: `(min-width: ${size.desktop}px)`,
};

// How wide the inner content should be
export enum contentSize {
  mobile = 0, // Todo
  tablet = 1, // Todo
  desktop = 1024,
}

export enum pageGutter {
  mobile = 16,
  tablet = 24,
}

export default breakpoints;
