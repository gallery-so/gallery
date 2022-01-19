export default function isProduction() {
  return typeof window !== 'undefined' && window.location.origin === 'https://gallery.so';
}
