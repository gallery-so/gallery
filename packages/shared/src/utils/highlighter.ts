const MAX_DESCRIPTION_CHARACTER = 150;

export function getHighlightedName(text: string, keyword: string) {
  return text.replace(new RegExp(keyword, 'gi'), (match) => `**${match}**`);
}

export function getHighlightedDescription(text: string, keyword: string) {
  const regex = new RegExp(keyword, 'gi');

  const unformattedDescription = sanitizeMarkdown(text ?? '');
  if (!keyword) {
    return unformattedDescription.substring(0, MAX_DESCRIPTION_CHARACTER);
  }

  const matchIndex = unformattedDescription.search(regex);
  let truncatedDescription;

  const maxLength = MAX_DESCRIPTION_CHARACTER;

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
