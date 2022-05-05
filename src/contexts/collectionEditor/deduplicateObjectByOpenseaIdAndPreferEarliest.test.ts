import deduplicateObjectByOpenseaIdAndPreferEarliest from './deduplicateObjectByOpenseaIdAndPreferEarliest';

describe('deduplicateObjectByOpenseaIdAndPreferEarliest', () => {
  it('handles empty objects', () => {
    expect(deduplicateObjectByOpenseaIdAndPreferEarliest({})).toEqual({});
  });

  it('handles objects without opensea IDs', () => {
    const nftWithoutOpenseaId = {
      '1zsXvHA8Y3iwqq9lzorrHIhw3GU': {
        index: 9,
        nft: {
          dbid: '1zsXvHA8Y3iwqq9lzorrHIhw3GU',
          name: 'Flowers #2078',
          lastUpdated: '2022-01-19T05:25:35.704518Z',
        },
        id: '1zsXvHA8Y3iwqq9lzorrHIhw3GU',
        isSelected: false,
      },
    };

    expect(
      // @ts-expect-error simulate the backend failing to return opensea IDs
      deduplicateObjectByOpenseaIdAndPreferEarliest(nftWithoutOpenseaId)
    ).toEqual(nftWithoutOpenseaId);
  });

  it('deduplicates properly', () => {
    const data = {
      '5zsXvDWYOrn9A42n83ezne4QjYF': {
        index: 0,
        nft: {
          dbid: '5zsXvDWYOrn9A42n83ezne4QjYF',
          name: 'Chromie Squiggle #2728',
          lastUpdated: '2022-02-17T07:23:06.778053Z',
          openseaId: 9999999999,
        },
        id: '5zsXvDWYOrn9A42n83ezne4QjYF',
        isSelected: false,
      },
      '27Xt9cs0aIvUnMm6pMVTppIcSgj': {
        index: 1,
        nft: {
          dbid: '27Xt9cs0aIvUnMm6pMVTppIcSgj',
          name: 'Venus',
          lastUpdated: '2022-04-09T04:21:47.859042Z',
          openseaId: 19652,
        },
        id: '27Xt9cs0aIvUnMm6pMVTppIcSgj',
        isSelected: false,
      },
      '3zsXvFt0w03yx6Ptjvvsi589x4g': {
        index: 2,
        nft: {
          dbid: '3zsXvFt0w03yx6Ptjvvsi589x4g',
          name: 'CryptoSerg #521',
          lastUpdated: '2022-01-19T05:25:35.704518Z',
          openseaId: 9999999999,
        },
        id: '3zsXvFt0w03yx6Ptjvvsi589x4g',
        isSelected: false,
      },
      '1zsXvDDNdSZ3xdMLSXWQRu8Kamj': {
        index: 3,
        nft: {
          dbid: '1zsXvDDNdSZ3xdMLSXWQRu8Kamj',
          name: 'A Study in Floral Hypercolor',
          lastUpdated: '2022-01-19T05:25:35.704518Z',
          openseaId: 51744,
        },
        id: '1zsXvDDNdSZ3xdMLSXWQRu8Kamj',
        isSelected: false,
      },
      '1zsXvDYssSQQNmxOB7pqJjHUC4A': {
        index: 4,
        nft: {
          dbid: '1zsXvDYssSQQNmxOB7pqJjHUC4A',
          name: 'April 14 2021',
          lastUpdated: '2022-01-19T05:25:35.704518Z',
          openseaId: 9999999999,
        },
        id: '1zsXvDYssSQQNmxOB7pqJjHUC4A',
        isSelected: false,
      },
      '27Xt9YL09Y4b57jFue3azuXBGsq': {
        index: 5,
        nft: {
          dbid: '27Xt9YL09Y4b57jFue3azuXBGsq',
          name: 'Living Souls',
          lastUpdated: '2022-04-09T05:40:21.603107Z',
          openseaId: 1646,
        },
        id: '27Xt9YL09Y4b57jFue3azuXBGsq',
        isSelected: false,
      },
      '1zsXvHIb4wy67nGX4Z4J5BKlpUY': {
        index: 6,
        nft: {
          dbid: '1zsXvHIb4wy67nGX4Z4J5BKlpUY',
          name: 'Bloom 150/2000',
          lastUpdated: '2022-01-19T05:25:35.704518Z',
          openseaId: 43977,
        },
        id: '1zsXvHIb4wy67nGX4Z4J5BKlpUY',
        isSelected: false,
      },
      '1zsXvGQvA8tBm5596RM8cLzaWUo': {
        index: 7,
        nft: {
          dbid: '1zsXvGQvA8tBm5596RM8cLzaWUo',
          name: 'Particle Story 001',
          lastUpdated: '2022-01-19T05:25:35.704518Z',
          openseaId: 48576,
        },
        id: '1zsXvGQvA8tBm5596RM8cLzaWUo',
        isSelected: false,
      },
      '1zsXvFpo5TgjWIuCMqXJD4O6BoG': {
        index: 8,
        nft: {
          dbid: '1zsXvFpo5TgjWIuCMqXJD4O6BoG',
          name: 'Particle Story 003',
          lastUpdated: '2022-01-19T05:25:35.704518Z',
          openseaId: 85804,
        },
        id: '1zsXvFpo5TgjWIuCMqXJD4O6BoG',
        isSelected: false,
      },
      '1zsXvHA8Y3iwqq9lzorrHIhw3GU': {
        index: 9,
        nft: {
          dbid: '1zsXvHA8Y3iwqq9lzorrHIhw3GU',
          name: 'Flowers #2078',
          lastUpdated: '2022-01-19T05:25:35.704518Z',
          openseaId: 76194,
        },
        id: '1zsXvHA8Y3iwqq9lzorrHIhw3GU',
        isSelected: false,
      },
    };

    const result = deduplicateObjectByOpenseaIdAndPreferEarliest(data);
    // the data contains 10 NFTs with 3 duplicate opensea IDs.
    // the de-duped version should have 8 NFTs as a result.
    expect(Object.keys(result)).toHaveLength(8);
    // the NFT that was preserved should be the "oldest".
    // our DB IDs are KSUIDs and are naturally sorted: https://github.com/segmentio/ksuid
    expect(result['1zsXvDYssSQQNmxOB7pqJjHUC4A']).toBeTruthy();
    expect(result['3zsXvFt0w03yx6Ptjvvsi589x4g']).toBeUndefined(); // same opensea ID but newer ID
    expect(result['5zsXvDWYOrn9A42n83ezne4QjYF']).toBeUndefined(); // same opensea ID but newer ID
  });
});
