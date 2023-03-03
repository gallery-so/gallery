export const getBaseUrl = () => {
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV;

  // If we're inside the Vercel environment
  switch (env) {
    case 'production':
      return 'https://gallery.so';
    case 'development':
      return `https://gallery-dev.vercel.app`;
    case 'preview':
      return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  // Otherwise, we're probably running locally?
  return 'http://localhost:3000';
};
