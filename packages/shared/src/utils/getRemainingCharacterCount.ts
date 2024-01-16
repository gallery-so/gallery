export const MAX_COMMENT_LENGTH = 300;
export const MAX_POST_LENGTH = 600;
export const MAX_COLLECTION_DESCRIPTION_LENGTH = 2400;

export function getRemainingCharacterCount(message: string, MAX_TEXT_LENGTH: number) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urlMatches = message.match(urlRegex);
  const urlLength = urlMatches?.reduce((acc, url) => acc + Math.ceil(url.length / 10), 0) || 0;

  const messageWithoutUrls = message.replace(urlRegex, '');

  return MAX_TEXT_LENGTH - messageWithoutUrls.length - urlLength;
}
