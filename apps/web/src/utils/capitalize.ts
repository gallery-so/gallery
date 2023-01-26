export default function capitalize(string_: string) {
  return `${string_[0].toUpperCase()}${string_.slice(1)}`;
}
