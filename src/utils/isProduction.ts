export default function isProduction() {
  return (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production'
  );
}
