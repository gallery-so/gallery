export function isSafari() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

export function isIosSafari() {
  const ua = window.navigator.userAgent;
  const iOS = Boolean(ua.match(/iP(ad|hone)/i));
  const webkit = Boolean(ua.match(/WebKit/i));
  return iOS && webkit && !ua.match(/CriOS/i);
}

export function isFirefox() {
  return navigator.userAgent.toLowerCase().includes('firefox');
}
