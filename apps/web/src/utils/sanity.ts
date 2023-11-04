// eslint-disable-next-line no-restricted-imports
import {
  fetchSanityContent as _fetchSanityContent,
  useSanityMaintenanceCheck as _useSanityMaintenanceCheck,
} from '~/shared/utils/sanity';

export const fetchSanityContent = _fetchSanityContent(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);

export const useSanityMaintenanceCheck = () => {
  return _useSanityMaintenanceCheck(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
};
