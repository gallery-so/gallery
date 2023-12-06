export function getMintUrlWithReferrer(url: string, referrer: string) {
  const mintFunRegex = new RegExp('https://mint.fun/');
  const zoraRegex = new RegExp('https://zora.co/');

  let mintProviderType = '';

  if (mintFunRegex.test(url)) {
    mintProviderType = 'mintFun';
  } else if (zoraRegex.test(url)) {
    mintProviderType = 'zora';
  }

  if (mintProviderType === 'mintFun') {
    return {
      url: `${url}?referrer=${referrer}`,
      provider: 'MintFun',
    };
  } else if (mintProviderType === 'zora') {
    return {
      url: `${url}?ref=${referrer}`,
      provider: 'Zora',
    };
  } else {
    return {
      url,
      provider: '',
    };
  }
}
