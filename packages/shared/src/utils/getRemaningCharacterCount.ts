export function getRemaningCharacterCount(message: string, MAX_TEXT_LENGTH: number) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urlMatches = message.match(urlRegex);
  const urlLength = urlMatches?.reduce((acc, url) => acc + Math.ceil(url.length / 10), 0) || 0;

  const messageWithoutUrls = message.replace(urlRegex, '');

  return MAX_TEXT_LENGTH - messageWithoutUrls.length - urlLength;
}
