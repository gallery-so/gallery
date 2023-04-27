export const getSanityUrl = (query: string) => {
  const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
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
