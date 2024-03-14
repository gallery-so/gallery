export const fetchSanityContent =
  (sanityProjectId: string | undefined) => async (query: string) => {
    const encodedQuery = encodeURIComponent(query);
    if (!sanityProjectId) {
      throw new Error('Missing CMS project id');
    }
    const url = `https://${sanityProjectId}.api.sanity.io/v1/data/query/production?query=${encodedQuery}`;
    const response = await fetch(url).then((res) => res.json());

    return response.result;
  };
