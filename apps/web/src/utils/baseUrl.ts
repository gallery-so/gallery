export function getBaseUrl(): string {
  const environment = process.env.NEXT_PUBLIC_VERCEL_ENV;

  if (environment === 'production') {
    return 'https://gallery.so';
  } else if (environment === 'development') {
    return `https://gallery-dev.vercel.app`;
  } else if (environment === 'preview') {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  // Otherwise, we're probably running locally?
  return 'http://localhost:3000';
}
