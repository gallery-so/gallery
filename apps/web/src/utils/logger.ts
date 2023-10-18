import { getTimestamp } from '~/shared/utils/time';

export const _log: Console['log'] = (...args) => {
  return console.log(`%c[${getTimestamp()}]`, 'color:#4878fa', `${args[0]}`, ...args.slice(1));
};
