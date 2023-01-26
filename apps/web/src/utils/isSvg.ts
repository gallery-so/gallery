export default function isSvg(src: string | undefined | null) {
  return Boolean(src?.includes('svg'));
}
