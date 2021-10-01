import sanitizePathname from './sanitizePathname';

describe('sanitizePathname', () => {
  it('removes trailing slash', () => {
    expect(sanitizePathname('/kaito/')).toEqual('/kaito');
  });

  it('removes redundant slash', () => {
    expect(sanitizePathname('///kaito//san//')).toEqual('/kaito/san');
  });
});
