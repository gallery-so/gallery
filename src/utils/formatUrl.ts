import { VALID_URL } from './regex';

export default function formatUrl(str: string): string {
  let matchesUrls = str.match(VALID_URL);
  let formattedText = str;
  matchesUrls?.map((url: string) => {
    formattedText = formattedText.replace(url, `[${url}](${url})`);
  });

  return formattedText;
}
