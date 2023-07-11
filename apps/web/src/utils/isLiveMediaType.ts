export default function isLiveMediaType(typename?: string | null) {
  return (
    typename === 'VideoMedia' ||
    typename === 'HtmlMedia' ||
    typename === 'GIFMedia' ||
    typename === 'GltfMedia'
  );
}
