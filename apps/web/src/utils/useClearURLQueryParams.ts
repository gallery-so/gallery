import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef } from 'react';

// clears a given parameter(s) from the URL.
//
// this is useful when wanting to ensure an action only occurs once;
// e.g. `settings=true` opens the settings sidebar, and we want to
// prevent any extraneous effects from opening it again.
//
// the user won't notice any weird behavior or redirects as their
// position will simply be replaced.
export function useClearURLQueryParams(param: string | string[]) {
  const { pathname, query: urlQuery, replace } = useRouter();

  const hasRenderedOnce = useRef(false);

  useEffect(() => {
    if (hasRenderedOnce.current) return;
    const params = new URLSearchParams(urlQuery as Record<string, string>);
    const paramsToClear = typeof param === 'string' ? [param] : param;
    for (const p of paramsToClear) {
      if (params.has(p)) {
        params.delete(p);
      }
    }
    // @ts-expect-error we're simply replacing the current page with the same path
    replace({ pathname, query: params.toString() }, undefined, { shallow: true });
    hasRenderedOnce.current = true;
  }, [param, pathname, replace, urlQuery]);
}

// imperative version of above effect
export function useClearURLQueryParamsImperatively(param: string | string[]) {
  const { pathname, query: urlQuery, replace } = useRouter();

  return useCallback(() => {
    const params = new URLSearchParams(urlQuery as Record<string, string>);
    const paramsToClear = typeof param === 'string' ? [param] : param;
    for (const p of paramsToClear) {
      if (params.has(p)) {
        params.delete(p);
      }
    }
    // @ts-expect-error we're simply replacing the current page with the same path
    replace({ pathname, query: params.toString() }, undefined, { shallow: true });
  }, [param, pathname, replace, urlQuery]);
}
