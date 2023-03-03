const getBaseUrl = () => {
  // const env = 'preview';
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV;
  console.log('getBaseUrl env', env);
  console.log('getBaseUrl', process.env.NEXT_PUBLIC_VERCEL_ENV);
  // If we're inside the Vercel environment
  switch (process.env.NEXT_PUBLIC_VERCEL_ENV) {
    case 'production':
      return 'https://gallery.so';
    case 'development':
      console.log('case dev');
      return `https://gallery-dev.vercel.app`;
    case 'preview':
      console.log('case preview', process.env.NEXT_PUBLIC_VERCEL_URL);
      return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  // Otherwise, we're probably running locally?
  return 'http://localhost:3000';
};

export const baseUrl = getBaseUrl();
