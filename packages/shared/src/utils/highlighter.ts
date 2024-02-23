export function getHighlightedName(text: string, keyword: string) {
  if (!keyword) {
    return text;
  }

  const sanitizedKeyword = sanitizeKeyword(keyword);

  const withoutMentionTag = sanitizedKeyword.replace(/^@/, '');

  return text.replace(new RegExp(withoutMentionTag, 'gi'), (match) => `**${match}**`);
}

export const MAX_DISPLAYED_DESCRIPTION_CHARS = 150;

export function getHighlightedDescription(text: string, keyword: string) {
  const sanitizedKeyword = sanitizeKeyword(keyword);

  const regex = new RegExp(sanitizedKeyword, 'gi');

  const unformattedDescription = sanitizeMarkdown(text ?? '');
  if (!keyword) {
    return unformattedDescription.substring(0, MAX_DISPLAYED_DESCRIPTION_CHARS);
  }

  const matchIndex = unformattedDescription.search(regex);
  let truncatedDescription;

  const maxLength = MAX_DISPLAYED_DESCRIPTION_CHARS;

  if (matchIndex > -1 && matchIndex + keyword.length === unformattedDescription.length) {
    const endIndex = Math.min(unformattedDescription.length, maxLength);
    truncatedDescription = `...${unformattedDescription.substring(endIndex - maxLength, endIndex)}`;
  } else {
    truncatedDescription = unformattedDescription.substring(0, maxLength);
  }
  // highlight keyword
  return truncatedDescription.replace(regex, (match) => `**${match}**`);
}

function sanitizeMarkdown(text: string) {
  return text
    .replace(/\*\*/g, '') // bold
    .replace(/\[([^[]*)\]\([^)]*\)/g, '$1') // link markdown tag from description
    .replace(/\n/g, ' '); // break line
}

// This line of code is sanitizing special characters, as well as replacing all instances of a single backslash with double backslashes.
// This is done to prevent any issues when the keyword is used in a regular expression, as backslashes are escape characters in regex.
function sanitizeKeyword(keyword: string) {
  return keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
