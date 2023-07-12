import { extractMirrorXyzUrl } from './extractMirrorXyzUrl';

describe('extractMirrorXyzUrl', () => {
  test('extracts correctly', () => {
    expect(extractMirrorXyzUrl('https://mirror.xyz/test/post')).toEqual('https://mirror.xyz');
    expect(extractMirrorXyzUrl('https://mirror.xyz/')).toEqual('https://mirror.xyz');
    expect(extractMirrorXyzUrl('https://mirror')).toEqual('');
    expect(extractMirrorXyzUrl('https://mirror.xzy')).toEqual('');
    expect(extractMirrorXyzUrl('https://mirror.xyz is the link')).toEqual('');
    expect(extractMirrorXyzUrl('mirror.xyz')).toEqual('');
  });
});
