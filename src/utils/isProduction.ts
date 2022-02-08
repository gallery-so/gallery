export default function isProduction() {
  console.log('NEXT_PUBLIC_VERCEL_ENV', process.env.NEXT_PUBLIC_VERCEL_ENV);
  console.log('NODE_ENV', process.env.NODE_ENV);
  return (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production'
  );
}
