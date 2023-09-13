// Regular expression to match URLs
const urlRegex =
  /(?:https:\/\/(?:www\.[^\s/$.?#].[^\s]*[^\s.,!?#$]|(?!www\.)[^\s/$.?#].[^\s]*[^\s.,!?#$])|www\.[^\s/$.?#].[^\s]*[^\s.,!?#$])/g;

export const convertToMarkdownLinks = (text: string) => {
  const unformattedStr = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  return unformattedStr.replace(urlRegex, (url: string) => `[${url}](${url})`);
};
