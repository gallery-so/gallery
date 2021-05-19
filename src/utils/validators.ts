/**
 * Helpers for client-side input validation
 */

import {
  ALPHANUMERIC_UNDERSCORES_PERIODS,
  NO_CONSECUTIVE_PERIODS_OR_UNDERSCORES,
} from './regex';

type OK = false;
type ValidatorReturnType = Error | OK;
type Validator = (value: any) => ValidatorReturnType;

export function validate(field: string, validators: Validator[]): string | OK {
  for (const validator of validators) {
    try {
      validator(field);
    } catch (e) {
      // return first error that's caught from list of validators
      return e.message;
    }
  }
  return false;
}

export function required(s: string): ValidatorReturnType {
  if (!s.length) {
    throw new Error('Required.');
  }
  return false;
}

export function minLength(len: number) {
  return function (s: string): ValidatorReturnType {
    if (s.length < len) {
      throw new Error(`Must be contain at least ${len} characters.`);
    }
    return false;
  };
}

export function maxLength(len: number) {
  return function (s: string): ValidatorReturnType {
    if (s.length > len) {
      throw new Error(`Must not exceed ${len} characters.`);
    }
    return false;
  };
}

export function alphanumericUnderscoresPeriods(s: string): ValidatorReturnType {
  if (!ALPHANUMERIC_UNDERSCORES_PERIODS.test(s)) {
    throw new Error(
      'Must only contain alphanumeric characters, underscores, or periods.'
    );
  }
  return false;
}

export function noConsecutivePeriodsOrUnderscores(
  s: string
): ValidatorReturnType {
  if (!NO_CONSECUTIVE_PERIODS_OR_UNDERSCORES.test(s)) {
    throw new Error('Must not contain consecutive underscores or periods.');
  }
  return false;
}
