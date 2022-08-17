import { ALPHANUMERIC_UNDERSCORES, VALID_URL } from './regex';

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

  test('VALID_URL', () => {
    const validUrls = [
      'https://collection.xyz/',
      'https://www.collection.xyz',
      'https://www.collection.xyz/gallery?q=main',
      'https://collection.xyz/',
      'https://collection.xyz',
      'https://collection.xyz/gallery?q=main',
      'https://webbtelescope.org/news/first-images',
    ];

    const invalidUrls = ['', 'http://invalid', 'https://invalid'];

    testRegex(VALID_URL, validUrls, true);
    testRegex(VALID_URL, invalidUrls, false);
  });
});
