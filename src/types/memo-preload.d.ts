/**
 * Override the types on `ExoticComponent` so the following works
 *
 * const SomeComponent = memo(()=> {});
 *
 * SomeComponent.preloadQuery = () => {};
 */

import { ReactElement } from 'react';

import { PreloadQueryFn } from '~/types/PageComponentPreloadQuery';

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/ban-types
  interface ExoticComponent<P = {}> {
    /**
     * **NOTE**: Exotic components are not callable.
     */
    (props: P): ReactElement | null;
    readonly $$typeof: symbol;

    // Above this line is stuff stolen from the React types
    // Here is where we tell TypeScript that it's okay to define
    // a `preloadQuery` on the function type.
    preloadQuery?: PreloadQueryFn;
  }
}
