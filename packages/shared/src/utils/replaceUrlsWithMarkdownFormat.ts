import { VALID_URL_IGNORE_MARKDOWN } from './regex';

export function replaceUrlsWithMarkdownFormat(input: string) {
  return input.replace(VALID_URL_IGNORE_MARKDOWN, (match, text, textInside, url, standaloneUrl) => {
    if (url || standaloneUrl) {
      // Check if the match is already inside square brackets
      if (
        (text && textInside) || // Inside both square brackets and parentheses
        (text && input.charAt(input.indexOf(match) - 1) === '(') || // Inside square brackets and following an open parenthesis
        (textInside && input.charAt(input.indexOf(match) - 1) === '[') // Inside parentheses and following an open square bracket
      ) {
        return match; // Return the match as-is
      } else {
        return `[${match}](${url || standaloneUrl})`; // Convert the match to a Markdown link
      }
    } else {
      return `[${text}](${match})`; // Convert the match to a Markdown link
    }
  });
}
