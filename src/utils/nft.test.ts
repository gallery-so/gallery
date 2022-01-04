import { NftMediaType } from 'components/core/enums';
import { getMediaType, getVideoUrl } from './nft';

const MOCK_NFT = {
  acquisition_date: 'TEST',
  animation_original_url: 'TEST',
  animation_url: 'TEST',
  asset_contract: {
    address: 'TEST',
    description: 'TEST',
    external_link: 'TEST',
    name: 'TEST',
    schema_name: 'TEST',
    symbol: 'TEST',
    total_supply: 'TEST',
    contract_image_url: 'TEST',
  },
  collectors_note: 'TEST',
  creation_time: 0,
  creator_address: 'TEST',
  creator_name: 'TEST',
  description: 'TEST',
  external_url: 'TEST',
  id: 'TEST',
  image_original_url: 'TEST',
  image_preview_url: 'TEST',
  image_thumbnail_url: 'TEST',
  image_url: 'TEST',
  name: 'TEST',
  opensea_id: 0,
  opensea_token_id: 'TEST',
  owner_address: 'TEST',
  owner_username: 'TEST',
  token_metadata_url: 'TEST',
  user_id: 'TEST',
};

describe('getMediaType', () => {
  test('Image', () => {
    const VIDEO_NFT = {
      ...MOCK_NFT,
      image_url: 'randomimage?h=140',
      animation_url: '',
    };

    expect(getMediaType(VIDEO_NFT)).toEqual(NftMediaType.IMAGE);
  });

  test('Video', () => {
    const VIDEO_NFT = {
      ...MOCK_NFT,
      image_url: 'https://previewimage.testtest',
      animation_url: 'thisisavideo.mp4',
      expectedMediaType: NftMediaType.VIDEO,
    };
    expect(getMediaType(VIDEO_NFT)).toEqual(NftMediaType.VIDEO);

    // Video without animation url
    const VIDEO_NFT_2 = {
      ...MOCK_NFT,
      image_url: 'thisisavideo.mp4',
      animation_url: '',
      expectedMediaType: NftMediaType.VIDEO,
    };
    expect(getMediaType(VIDEO_NFT_2)).toEqual(NftMediaType.VIDEO);

    //
    const VIDEO_NFT_3 = {
      ...MOCK_NFT,
      image_url: 'thisisavideo.mp4',
      animation_url: 'randomanimationurl',
      expectedMediaType: NftMediaType.VIDEO,
    };
    expect(getMediaType(VIDEO_NFT_3)).toEqual(NftMediaType.VIDEO);
  });

  test('Animation', () => {
    const ANIMATION_NFT = {
      ...MOCK_NFT,
      image_url: 'randomimage?h=140',
      animation_url: 'gallery.so/generative_art.html',
    };

    expect(getMediaType(ANIMATION_NFT)).toEqual(NftMediaType.ANIMATION);

    const ANIMATION_NFT_2 = {
      ...MOCK_NFT,
      image_url: 'randomimage?h=140',
      animation_url: 'https://generator.artblocks.io/163000516',
    };

    expect(getMediaType(ANIMATION_NFT_2)).toEqual(NftMediaType.ANIMATION);

    const ANIMATION_NFT_3 = {
      ...MOCK_NFT,
      image_url: 'randomimage?h=140',
      animation_url: 'https://ethblock.art/canvas/blockart/420',
    };

    expect(getMediaType(ANIMATION_NFT_3)).toEqual(NftMediaType.ANIMATION);
  });

  test('Audio', () => {
    const AUDIO_NFT = {
      ...MOCK_NFT,
      image_url: 'randomimage?h=140',
      animation_url: 'gallery.so/audio_file.mp3',
    };

    expect(getMediaType(AUDIO_NFT)).toEqual(NftMediaType.AUDIO);
  });
});

describe('getVideoUrl', () => {
  const VIDEO_URL = 'https://storage.opensea.io/files/328e0881f68bf579d293d84cbfe33349.mp4';
  const NON_VIDEO_URL = 'https://api.heaven.computer/ghost/7485';

  test('Image url is video', () => {
    const VIDEO_NFT = {
      ...MOCK_NFT,
      image_url: VIDEO_URL,
      animation_url: NON_VIDEO_URL,
    };

    expect(getVideoUrl(VIDEO_NFT)).toEqual(VIDEO_URL);
  });

  test('Image url is not video', () => {
    const VIDEO_NFT = {
      ...MOCK_NFT,
      image_url: NON_VIDEO_URL,
      animation_url: VIDEO_URL,
    };

    expect(getVideoUrl(VIDEO_NFT)).toEqual(VIDEO_URL);
  });
});
