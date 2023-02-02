interface Window {
  ethereum?: Record<string, unknown>;
  web3?: Record<string, unknown>;
}

declare module '*.svg' {
  import React from 'react';
  const SVG: React.VFC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}

declare module 'babel-plugin-relay/macro' {
  export { graphql } from 'react-relay';
}

declare module 'ethereumjs-util';
