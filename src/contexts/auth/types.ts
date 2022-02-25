export type LOGGED_IN = { type: 'LOGGED_IN'; userId: string };
export const LOGGED_OUT = Symbol('LOGGED_OUT');
export const LOADING = Symbol('LOADING');
export const UNKNOWN = Symbol('UNKNOWN');
