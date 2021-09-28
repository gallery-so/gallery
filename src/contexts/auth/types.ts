export type LoggedInState = { jwt: string; userId: string; address?: string };
export const LOGGED_OUT = Symbol('LOGGED_OUT');
export const LOADING = Symbol('LOADING');
export const UNKNOWN = Symbol('UNKNOWN');
