export function generate12DigitId() {
  return Math.round(Math.random() * 1000000000000).toString();
}
