export const ALPHANUMERIC_UNDERSCORES = /^\w+$/i;

export const NO_CONSECUTIVE_PERIODS_OR_UNDERSCORES = /^(?=[\w.]*$)(?!.*[_.]{2})[^_.].*[^_.]$/;

// ends with =s256, =s128, etc.
export const GOOGLE_CONTENT_IMG_URL = /=s\d{3}$/;

export const VALID_URL = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9(@:%_\+.~#?&\/=]*)/;
