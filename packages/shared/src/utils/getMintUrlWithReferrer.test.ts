import { getMintUrlWithReferrer } from './getMintUrlWithReferrer';

describe('getMintUrlWithReferrer', () => {
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

  it('should not append referrer to ensemble.art URLs', () => {
    const url = 'https://www.ensemble.art/sketch/0x0d656e3ecfa3d9a9b9792ff33f09ff5f55cb8316/30';
    const referrer = 'referrer5';
    const result = getMintUrlWithReferrer(url, referrer);
    expect(result.url).toBe(
      'https://www.ensemble.art/sketch/0x0d656e3ecfa3d9a9b9792ff33f09ff5f55cb8316/30'
    );
    expect(result.provider).toBe('Ensemble');
  });

  it('should not append referrer to superrare.com URLs', () => {
    const url = 'https://superrare.com/0x109c5a04ef63395ea09a2062f9ac30bf2978c609/hue-haven-46';
    const referrer = 'referrer6';
    const result = getMintUrlWithReferrer(url, referrer);
    expect(result.url).toBe(
      'https://superrare.com/0x109c5a04ef63395ea09a2062f9ac30bf2978c609/hue-haven-46'
    );
    expect(result.provider).toBe('SuperRare');
  });

  it('should not append referrer to highlight.xyz URLs', () => {
    const url = 'https://highlight.xyz/mint/657191e2452b7c1626dcd551';
    const referrer = 'referrer7';
    const result = getMintUrlWithReferrer(url, referrer);
    expect(result.url).toBe('https://highlight.xyz/mint/657191e2452b7c1626dcd551');
    expect(result.provider).toBe('Highlight');
  });

  it('should not append referrer to foundation.app URLs', () => {
    const url = 'https://foundation.app/@kero/glitchportraits/40';
    const referrer = 'referrer8';
    const result = getMintUrlWithReferrer(url, referrer);
    expect(result.url).toBe('https://foundation.app/@kero/glitchportraits/40');
    expect(result.provider).toBe('Foundation');
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
