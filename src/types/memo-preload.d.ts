import { ReactElement } from 'react';

import { PreloadQueryFn } from '~/types/PageComponentPreloadQuery';

declare module 'react' {
  interface ExoticComponent<P = {}> {
    /**
     * **NOTE**: Exotic components are not callable.
     */
    (props: P): ReactElement | null;
    readonly $$typeof: symbol;
    preloadQuery?: PreloadQueryFn;
  }
}
