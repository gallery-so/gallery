import formatUrl from './formatUrl';

describe('formatUrl', () => {
  describe('format description to Markdown', () => {
    it('handles unformatted description', () => {
      const result = formatUrl(
        'The entire collection can be viewed by visiting https://currency.nft.heni.com/'
      );
      expect(result).toEqual(
        'The entire collection can be viewed by visiting [https://currency.nft.heni.com/](https://currency.nft.heni.com/)'
      );
    });

    it('handles fully formatted description', () => {
      const result = formatUrl('New Age Collective [misfits.xyz](https://misfits.xyz/)');
      expect(result).toEqual('New Age Collective [misfits.xyz](https://misfits.xyz/)');
    });

    it('ignores invalid URLs', () => {
      const result = formatUrl('All started at www.myspace.com');
      expect(result).toEqual('All started at www.myspace.com');
    });
  });
});
