export default function isProduction() {
  console.log('isProduction', process.env.NEXT_PUBLIC_VERCEL_ENV);
  return process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
}
