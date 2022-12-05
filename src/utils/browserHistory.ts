export function historyPushState(url: string) {
  if (typeof window !== 'undefined') {
    window.history.pushState({}, '', url);
  }
}

export function historyReplaceState(url: string) {
  if (typeof window !== 'undefined') {
    window.history.replaceState({}, '', url);
  }
}
