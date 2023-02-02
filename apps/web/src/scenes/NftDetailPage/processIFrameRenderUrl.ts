export default function processIFrameRenderUrl(url: string) {
  // ---------- HANDLE YOUTUBE EMBEDS ----------
  if (url.includes('youtube.com/watch?v=')) {
    // YouTube links must be replaced with `embed`: https://stackoverflow.com/a/25661346
    const replaced = url.replace('youtube.com/watch', 'youtube.com/embed');
    const urlObj = new URL(replaced);
    const params = new URLSearchParams(urlObj.search);
    // And `autoplay` query param: https://stackoverflow.com/a/7286526
    params.set('autoplay', '1');
    params.set('controls', '0');
    params.set('loop', '1');
    params.set('modestbranding', '1');
    // Get video ID and delete it from params, since it's not query param in the embed URL
    const videoId = params.get('v');
    params.delete('v');
    return `${urlObj.origin}${urlObj.pathname}/${videoId}?${params.toString()}`;
  }

  return url;
}
