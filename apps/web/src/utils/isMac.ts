export default function isMac() {
  return typeof window !== undefined && window.navigator.platform.includes('Mac');
}
