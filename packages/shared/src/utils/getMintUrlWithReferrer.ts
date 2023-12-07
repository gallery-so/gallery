export function getMintUrlWithReferrer(url: string, referrer: string) {
  const providers = [
    { regex: '^https://(www\\.)?mint.fun/?', type: 'mintFun', name: 'MintFun', param: 'ref' },
    { regex: '^https://(www\\.)?zora.co/?', type: 'zora', name: 'Zora', param: 'referrer' },
    { regex: '^https://(www\\.)?fxhash.xyz/?', type: 'fxhash', name: 'FxHash' },
    {
      regex: '^https://(www\\.)?prohibition.art/?',
      type: 'prohibitionArt',
      name: 'ProhibitionArt',
    },
  ];

  let provider = providers.find((p) => new RegExp(p.regex).test(url));
  let urlObj = new URL(url);

  if (provider && provider.param && !urlObj.searchParams.has(provider.param)) {
    urlObj.searchParams.append(provider.param, referrer);
  }

  return {
    url: urlObj.toString(),
    provider: provider ? provider.name : '',
  };
}
