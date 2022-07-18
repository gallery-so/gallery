export default function isLiveMediaType(typename?: string | null) {
  return typename === 'VideoMedia' || typename === 'HtmlMedia';
  // wait until we have further clarity on gltf support
  // || typename === 'GltfMedia'
}
