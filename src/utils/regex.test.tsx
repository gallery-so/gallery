import { USERNAME_REGEX } from './regex';

function testRegex(
  pattern: RegExp,
  values: string[],
  expectedValue: boolean,
) {
  for (const value of values) {
    expect(pattern.test(value)).toBe(expectedValue);
  }
}

describe.skip('regex', () => {
  test('USERNAME_REGEX', () => {
    const validUsernames = ['testCollector', 'numbersAreOk123'];
    const invalidUsernames = [
      '',
      'space in name',
      'BadCharacter$',
      'wayTooooooooooLoonnnnggg',
    ];

    testRegex(USERNAME_REGEX, validUsernames, true);
    testRegex(USERNAME_REGEX, invalidUsernames, false);
  });
});
