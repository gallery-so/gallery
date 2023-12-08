import { getMintUrlWithReferrer } from './getMintUrlWithReferrer';

describe('getMintUrlWithReferrer', () => {
  it('should append referrer to mint.fun URLs', () => {
    const url = 'https://mint.fun/op/12345';
    const referrer = 'referrer1';
    const result = getMintUrlWithReferrer(url, referrer);
    expect(result.url).toBe('https://mint.fun/op/12345?ref=referrer1');
    expect(result.provider).toBe('MintFun');
  });

  it('should append referrer to zora.co URLs', () => {
    const url = 'https://zora.co/collect/zora:0xaa8c4286883c46ffc3225500f4955f8edc0a351f/2';
    const referrer = 'referrer2';
    const result = getMintUrlWithReferrer(url, referrer);
    expect(result.url).toBe(
      'https://zora.co/collect/zora:0xaa8c4286883c46ffc3225500f4955f8edc0a351f/2?referrer=referrer2'
    );
    expect(result.provider).toBe('Zora');
  });

  it('should not append referrer to fxhash.xyz URLs', () => {
    const url = 'https://www.fxhash.xyz/gentk/slug/smolskulls-monster-gaze-262';
    const referrer = 'referrer3';
    const result = getMintUrlWithReferrer(url, referrer);
    expect(result.url).toBe('https://www.fxhash.xyz/gentk/slug/smolskulls-monster-gaze-262');
    expect(result.provider).toBe('FxHash');
  });

  it('should not append referrer to prohibition.art URLs', () => {
    const url = 'https://prohibition.art/project/heart-craft';
    const referrer = 'referrer4';
    const result = getMintUrlWithReferrer(url, referrer);
    expect(result.url).toBe('https://prohibition.art/project/heart-craft');
    expect(result.provider).toBe('Prohibition');
  });

  it('should not append referrer if mint.fun already have ref', () => {
    const url =
      'https://mint.fun/op/0xcA1cb17d65CeF28087Bf1f65B4D599c768F870Ac?ref=0x517AEa67196C8975dd100236689D0CA10B928F58';
    const referrer = 'newReferrer';
    const result = getMintUrlWithReferrer(url, referrer);
    expect(result.url).toBe(
      'https://mint.fun/op/0xcA1cb17d65CeF28087Bf1f65B4D599c768F870Ac?ref=0x517AEa67196C8975dd100236689D0CA10B928F58'
    );
    expect(result.provider).toBe('MintFun');
  });

  it('should not append referrer if zora.co already have referrer', () => {
    const url =
      'https://zora.co/collect/zora:0x7c2668BD0D3c050703CEcC956C11Bd520c26f7d4/2?referrer=0x517AEa67196C8975dd100236689D0CA10B928F58';
    const referrer = 'newReferrer';
    const result = getMintUrlWithReferrer(url, referrer);
    expect(result.url).toBe(
      'https://zora.co/collect/zora:0x7c2668BD0D3c050703CEcC956C11Bd520c26f7d4/2?referrer=0x517AEa67196C8975dd100236689D0CA10B928F58'
    );
    expect(result.provider).toBe('Zora');
  });

  it('should return original url if url is empty', () => {
    const url = '';
    const referrer = 'referrer';
    const result = getMintUrlWithReferrer(url, referrer);
    expect(result.url).toBe('');
    expect(result.provider).toBeUndefined();
  });

  it('should return original url if url is not a provider url', () => {
    const url = 'https://www.google.com';
    const referrer = 'referrer';
    const result = getMintUrlWithReferrer(url, referrer);
    expect(result.url).toBe('https://www.google.com/');
    expect(result.provider).toBeUndefined();
  });
});
