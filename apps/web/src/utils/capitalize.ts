export default function capitalize(string_: string) {
  const firstChar = string_[0] ?? '';

  return `${firstChar.toUpperCase()}${string_.slice(1)}`;
}
