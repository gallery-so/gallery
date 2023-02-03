export default function isVideoUrl(src: string) {
  return src.includes('.mp4') || src.includes('.webm');
}
