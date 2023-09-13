// Regular expression to match URLs
const urlRegex = /(?:https|ftp):\/\/[^\s/$.?#].[^\s]*[^\s.,!?#$]/g;

export const convertToMarkdownLinks = (text: string) => {
  return text.replace(urlRegex, (url: string) => `[${url}](${url})`);
};
