enum size {
  mobile = '320px',
  tablet = '768px',
  desktop = '1100px',
}

const breakpoints = {
  mobile: `(min-width: ${size.mobile})`,
  tablet: `(min-width: ${size.tablet})`,
  desktop: `(min-width: ${size.desktop})`,
};

export default breakpoints;
