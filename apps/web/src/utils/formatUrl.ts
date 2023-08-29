import { VALID_URL } from '~/shared/utils/regex';

export default function formatUrl(str: string): string {
  const unformattedStr = str.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  const matchesUrls = unformattedStr.match(VALID_URL);
  let formattedText = str;
  matchesUrls?.map((url: string) => {
    formattedText = formattedText.replace(url, `[${url}](${url})`);
  });

  return formattedText;
}
