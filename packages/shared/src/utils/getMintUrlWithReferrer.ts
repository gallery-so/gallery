const providers = [
  { regex: '^https://(www\\.)?mint.fun/?', name: 'MintFun', param: 'ref' },
  { regex: '^https://(www\\.)?zora.co/?', name: 'Zora', param: 'referrer' },
  { regex: '^https://(www\\.)?fxhash.xyz/?', name: 'FxHash' },
  {
    regex: '^https://(www\\.)?prohibition.art/?',
    name: 'Prohibition',
  },
];

export function getMintUrlWithReferrer(url: string, referrer: string) {
  try {
    const urlObj = new URL(url);
    const provider = providers.find((p) => new RegExp(p.regex).test(url));

    if (provider && provider.param && !urlObj.searchParams.has(provider.param)) {
      urlObj.searchParams.append(provider.param, referrer);
    }

    return {
      url: urlObj.toString(),
      provider: provider ? provider.name : undefined,
    };
  } catch (e) {
    return {
      url: '',
      provider: undefined,
    };
  }
}

export function checkValidMintUrl(url: string) {
  return providers.some((p) => new RegExp(p.regex).test(url));
}
