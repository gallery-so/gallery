export const baseurl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

export const vanillaFetcher = async (...args: Parameters<typeof fetch>) =>
  fetch(...args).then(async (res) => res.json());
