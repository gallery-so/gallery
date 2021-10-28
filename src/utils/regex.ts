export const ALPHANUMERIC_UNDERSCORES = /^\w+$/i;

export const NO_CONSECUTIVE_PERIODS_OR_UNDERSCORES = /^(?=[\w.]*$)(?!.*[_.]{2})[^_.].*[^_.]$/;
