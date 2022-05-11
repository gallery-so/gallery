export default function isTouchscreenDevice() {
  return (typeof window !== undefined && 'ontouchstart' in window) || navigator.maxTouchPoints > 0;
}
