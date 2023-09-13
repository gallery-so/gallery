import { convertToMarkdownLinks } from './convertToMarkdownLinks';

describe('convertToMarkdownLinks', () => {
  test('converts strings with already markdown formatted urls correctly to markdown', () => {
    expect(
      convertToMarkdownLinks(
        'in between the [https://mirror.xyz/](https://mirror.xyz/) and https://asystem.dev/'
      )
    ).toEqual(
      'in between the [https://mirror.xyz/](https://mirror.xyz/) and [https://asystem.dev/](https://asystem.dev/)'
    );
  });
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
