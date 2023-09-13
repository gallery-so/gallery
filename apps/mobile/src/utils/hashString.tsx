// theres no native sha256 available for react-native and the current use case (obfuscating event url param) doesnt necessitate a proper secure hash, so use a very simple "hash" instead
export async function simpleHash(input: string) {
  let hash = 0,
    chr;
  if (input.length === 0) return hash;
  for (let i = 0; i < input.length; i++) {
    chr = input.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}
