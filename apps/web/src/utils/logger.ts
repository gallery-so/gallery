import { getTimestamp } from '~/shared/utils/time';

import isProduction from './isProduction';

export const _log: Console['log'] = (...args) => {
  if (isProduction()) {
    return;
  }
  return console.log(`%c[${getTimestamp()}]`, 'color:#4878fa', `${args[0]}`, ...args.slice(1));
};
