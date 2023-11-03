import { env } from '~/env/runtime';
// eslint-disable-next-line no-restricted-imports
import { fetchSanityContent as _fetchSanityContent } from '~/shared/utils/sanity';

export const fetchSanityContent = _fetchSanityContent(env.SANITY_PROJECT_ID);
