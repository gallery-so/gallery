export default function processProjectUrl(data: string) {
  if (isValidHttpsUrl(data)) {
    return data;
  }
  return '';
}

function isValidHttpsUrl(url: string): boolean {
  const pattern = new RegExp(
    '^(https://)' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  ); // fragment locator
  return Boolean(pattern.test(url));
}
