import { env } from '~/env/runtime';

export const getSanityUrl = (query: string) => {
  const sanityProjectId = env.SANITY_PROJECT_ID;
  if (!sanityProjectId) {
    throw new Error('Missing CMS project id');
  }

  return `https://${sanityProjectId}.api.sanity.io/v1/data/query/production?query=${query}`;
};

export const fetchSanityContent = async (query: string) => {
  const encodedQuery = encodeURIComponent(query);
  const url = getSanityUrl(encodedQuery);
  const response = await fetch(url).then((res) => res.json());

  return response.result;
};
