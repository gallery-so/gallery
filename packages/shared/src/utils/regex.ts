export const ALPHANUMERIC_UNDERSCORES = /^\w+$/i;

export const NO_CONSECUTIVE_PERIODS_OR_UNDERSCORES = /^(?=[\w.]*$)(?!.*[_.]{2})[^_.].*[^_.]$/;

// ends with =s256, =s128, etc.
export const GOOGLE_CONTENT_IMG_URL = /=s\d{3}$/;

export const VALID_URL =
  /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9(@:%_\+.~#?&\/=]*)/;

// standard email format x@x.xx
export const EMAIL_FORMAT = /^[\w-\.+]+@([\w-]+\.)+[\w-]{2,4}$/;

// break lines
export const BREAK_LINES = /(\r\n|\n|\r|\\\n)/gm;

// check https in URL
export const HTTPS_URL = /^https?:\/\//i;

// check if ethereum address
export const ETH_ADDRESS = /^0x[a-fA-F0-9]{40}$/;
