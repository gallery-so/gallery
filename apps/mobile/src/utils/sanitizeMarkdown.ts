export function sanitizeMarkdown(text: string) {
  return text
    .replace(/\*\*/g, '') // bold
    .replace(/\[.*\]\(.*\)/g, '') // link markdown tag from description
    .replace(/\n/g, ' '); // break line
}
