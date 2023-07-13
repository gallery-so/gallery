import { extractMirrorXyzUrl } from './extractMirrorXyzUrl';

function generateData(description: string) {
  return `{"animation_url":"https://mirror.xyz/10/0x9fe9f4b985234ff185ecddb980e7567262b71b6f/render","description":"${description}","external_url":"","format":"png","image_url":"ipfs://QmPj5kFNhugP1V7s6yMRJtKSQUagMb2iDcNsKXc2miJpdy","media_type":"png","name":"When the sun hits 3"}`;
}

describe('extractMirrorXyzUrl', () => {
  test('extracts correctly', () => {
    expect(extractMirrorXyzUrl(generateData('https://mirror.xyz/test/post'))).toEqual(
      'https://mirror.xyz/test/post'
    );

    expect(extractMirrorXyzUrl(generateData('https://mirror.xyz/'))).toEqual('https://mirror.xyz/');
    expect(extractMirrorXyzUrl(generateData('https://mirror'))).toEqual('');
    expect(extractMirrorXyzUrl(generateData('https://mirror.xzy'))).toEqual('');
    expect(extractMirrorXyzUrl(generateData('https://mirror.xyz/posts/235 is the link'))).toEqual(
      ''
    );
    expect(extractMirrorXyzUrl(generateData('mirror.xyz'))).toEqual('');
  });
});
