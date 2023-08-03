import { format, parse } from 'date-fns';

export default function extractPoapMetadata(tokenMetadata: string) {
  const { city, country, created, event_id: id, supply, chain } = JSON.parse(tokenMetadata) ?? {};

  const location = city && country ? `${city}, ${country}` : '';
  const parsedDate = created ? parse(created, 'yyyy-MM-dd HH:mm:ss', new Date()) : null;
  const createdDate = parsedDate ? format(parsedDate, 'MMMM do, yyyy') : '';

  return {
    id,
    location,
    createdDate,
    supply,
    chain,
  };
}
