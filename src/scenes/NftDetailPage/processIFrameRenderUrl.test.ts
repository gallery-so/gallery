import processIFrameRenderUrl from './processIFrameRenderUrl';

describe('processIFrameRenderUrl', () => {
  describe('youtube', () => {
    it('handles youtube URLs', () => {
      const result = processIFrameRenderUrl('https://www.youtube.com/watch?v=FthSdzBltP4');
      expect(result).toEqual(
        'https://www.youtube.com/embed/FthSdzBltP4?autoplay=1&controls=0&loop=1&modestbranding=1'
      );
    });

    it('handles youtube URLs with params', () => {
      const result = processIFrameRenderUrl(
        'https://www.youtube.com/watch?v=FthSdzBltP4&chain=ethereum'
      );
      expect(result).toEqual(
        'https://www.youtube.com/embed/FthSdzBltP4?chain=ethereum&autoplay=1&controls=0&loop=1&modestbranding=1'
      );
    });

    it('ignores other URLs', () => {
      const result = processIFrameRenderUrl('https://www.myspace.com/not/youtube');
      expect(result).toEqual('https://www.myspace.com/not/youtube');
    });
  });
});
