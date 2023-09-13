import { convertToMarkdownLinks } from './convertToMarkdownLinks';

describe('convertToMarkdownLinks', () => {
  test('converts urls to markdown links correctly', () => {
    expect(
      convertToMarkdownLinks(
        'here are some valid urls: https://www.fxhash.xyz/generative/slug/toccata, https://highlight.xyz/mint/64ef4dc173490a0eb6d63bda and some invalid ones www.hello.com, http://bad-link.com'
      )
    ).toEqual(
      'here are some valid urls: [https://www.fxhash.xyz/generative/slug/toccata](https://www.fxhash.xyz/generative/slug/toccata), [https://highlight.xyz/mint/64ef4dc173490a0eb6d63bda](https://highlight.xyz/mint/64ef4dc173490a0eb6d63bda) and some invalid ones www.hello.com, http://bad-link.com'
    );
  });
});
