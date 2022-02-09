const getBaseUrl = () => {
  // If we're inside the Vercel environment
  switch (process.env.NEXT_PUBLIC_VERCEL_ENV) {
    case 'production':
      return 'https://gallery.so';
    case 'development':
      return `https://gallery-dev.vercel.app`;
    case 'preview':
      return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  // Otherwise, we're probably running locally?
  if (process.env.NODE_ENV === 'production') {
    return 'https://gallery.so';
  }

  // TODO: figure out if/what hostname needed for tests

  return `http://localhost:3000`;
};

export const baseUrl = getBaseUrl();
