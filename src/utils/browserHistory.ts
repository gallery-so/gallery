export function historyReplaceState(url: string | URL) {
  if (typeof window !== 'undefined') {
    window.history.replaceState({}, '', url);
  }
}
