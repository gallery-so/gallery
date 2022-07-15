import {
  collectionTokenSettingsArrayToObject,
  collectionTokenSettingsObjectToArray,
} from './collectionTokenSettings';

describe('collectionTokenSettings', () => {
  it('converts server provided array into an object', () => {
    const arr = [
      {
        tokenId: '23OkQNXUHzhcpCIBbGIV9LWRFj4',
        renderLive: true,
      },
      {
        tokenId: '2BoKavrjka06H7dkkmate49yJFQ',
        renderLive: false,
      },
      {
        tokenId: '2BoL8sIVBcNIgUP13fEQxKSPbOW',
        renderLive: true,
      },
    ];

    const expectedResult = {
      '23OkQNXUHzhcpCIBbGIV9LWRFj4': true,
      '2BoL8sIVBcNIgUP13fEQxKSPbOW': true,
    };

    expect(collectionTokenSettingsArrayToObject(arr)).toEqual(expectedResult);
  });

  it('converts locally stored object into an array', () => {
    const obj = {
      '23OkQNXUHzhcpCIBbGIV9LWRFj4': true,
      '2BoL8sIVBcNIgUP13fEQxKSPbOW': true,
    };

    const expectedResult = [
      {
        tokenId: '23OkQNXUHzhcpCIBbGIV9LWRFj4',
        renderLive: true,
      },
      {
        tokenId: '2BoL8sIVBcNIgUP13fEQxKSPbOW',
        renderLive: true,
      },
    ];

    expect(collectionTokenSettingsObjectToArray(obj)).toEqual(expectedResult);
  });
});
