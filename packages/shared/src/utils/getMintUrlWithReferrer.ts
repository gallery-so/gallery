export function getMintUrlWithReferrer(url: string, referrer: string) {
  const mintFunRegex = new RegExp('^https://(www\\.)?mint.fun/');
  const zoraRegex = new RegExp('^https://(www\\.)?zora.co/');
  const fxhashRegex = new RegExp('^https://(www\\.)?fxhash.xyz/');
  const prohibitionArtRegex = new RegExp('^https://(www\\.)?prohibition.art/');

  let mintProviderType = '';

  if (mintFunRegex.test(url)) {
    mintProviderType = 'mintFun';
  } else if (zoraRegex.test(url)) {
    mintProviderType = 'zora';
  } else if (fxhashRegex.test(url)) {
    mintProviderType = 'fxhash';
  } else if (prohibitionArtRegex.test(url)) {
    mintProviderType = 'prohibitionArt';
  }

  if (mintProviderType === 'mintFun') {
    return {
      url: `${url}?ref=${referrer}`,
      provider: 'MintFun',
    };
  } else if (mintProviderType === 'zora') {
    return {
      url: `${url}?referrer=${referrer}`,
      provider: 'Zora',
    };
  } else if (mintProviderType === 'fxhash') {
    return {
      url: `${url}`,
      provider: 'FxHash',
    };
  } else if (mintProviderType === 'prohibitionArt') {
    return {
      url: `${url}`,
      provider: 'ProhibitionArt',
    };
  } else {
    return {
      url,
      provider: '',
    };
  }
}
