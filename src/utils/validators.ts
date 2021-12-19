/**
 * Helpers for client-side input validation
 */

import { ALPHANUMERIC_UNDERSCORES, NO_CONSECUTIVE_PERIODS_OR_UNDERSCORES } from './regex';

type OK = false;
type ValidatorReturnType = Error | OK;
type Validator = (value: any) => ValidatorReturnType;

export function validate(field: string, validators: Validator[]): string | OK {
  for (const validator of validators) {
    try {
      validator(field);
    } catch (error: unknown) {
      // Return first error that's caught from list of validators
      if (error instanceof Error) {
        return error.message;
      }
    }
  }

  return false;
}

export function required(s: string): ValidatorReturnType {
  if (s.length === 0) {
    throw new Error('Required.');
  }

  return false;
}

export function minLength(length: number) {
  return function (s: string): ValidatorReturnType {
    if (s.length < length) {
      throw new Error(`Must contain at least ${length} characters.`);
    }

    return false;
  };
}

export function maxLength(length: number) {
  return function (s: string): ValidatorReturnType {
    if (s.length > length) {
      throw new Error(`Must not exceed ${length} characters.`);
    }

    return false;
  };
}

export function alphanumericUnderscores(s: string): ValidatorReturnType {
  if (!ALPHANUMERIC_UNDERSCORES.test(s)) {
    throw new Error('Must only contain alphanumeric characters, or underscores.');
  }

  return false;
}

export function noConsecutivePeriodsOrUnderscores(s: string): ValidatorReturnType {
  if (!NO_CONSECUTIVE_PERIODS_OR_UNDERSCORES.test(s)) {
    throw new Error('Must not contain consecutive underscores or periods.');
  }

  return false;
}
