import { ALPHANUMERIC_UNDERSCORES } from './regex';

function testRegex(pattern: RegExp, values: string[], expectedValue: boolean) {
  for (const value of values) {
    expect(pattern.test(value)).toBe(expectedValue);
  }
}

describe('regex', () => {
  test('ALPHANUMERIC_UNDERSCORES', () => {
    const validUsernames = ['testCollector', 'numbersAreOk123', 'under_score_ok'];
    const invalidUsernames = ['', 'space in name', 'BadCharacter$', 'has.period.eth'];

    testRegex(ALPHANUMERIC_UNDERSCORES, validUsernames, true);
    testRegex(ALPHANUMERIC_UNDERSCORES, invalidUsernames, false);
  });
});
