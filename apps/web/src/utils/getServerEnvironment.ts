// the backend environment the frontend is pointing to
export function getServerEnvironment() {
  const environment = process.env.NEXT_PUBLIC_VERCEL_ENV;

  // if the app is deployed to vercel
  if (environment) {
    return environment;
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  // if the app is running locally
  if (apiBaseUrl === 'https://api.gallery.so') {
    return 'production';
  } else if (apiBaseUrl === 'https://api.dev.gallery.so') {
    return 'development';
  } else if (apiBaseUrl === 'https://api.sandbox.gallery.so') {
    return 'sandbox';
  } else if (apiBaseUrl === 'http://localhost:4000') {
    return 'local';
  }
}
