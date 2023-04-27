export const getSanityUrl = (query: string) => {
  const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!sanityProjectId) {
    throw new Error('Missing CMS project id');
  }

  return `https://${sanityProjectId}.api.sanity.io/v1/data/query/production?query=${query}`;
};

export const fetchSanityContent = async (contentType: string) => {
  const query = encodeURIComponent(`*[ _type == "${contentType}" ]`);
  const url = getSanityUrl(query);
  const response = await fetch(url).then((res) => res.json());

  return response.result;
};
