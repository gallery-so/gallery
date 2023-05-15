export function isDarkMode() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}
