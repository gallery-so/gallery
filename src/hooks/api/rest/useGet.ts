import useSwr from 'swr';
import RequestAction from './RequestAction';

/**
 * Returns data from provided endpoint. Should be called near
 * the top of a component. Pass in `null` for path if you don't
 * want a request to be made (allowing for "conditional" hooks)
 *
 * Usage:
 *
 *   const collection = useGet('/collections/123')
 *
 *   return <Title>{collection.title}</Title>
 *
 */
export default function useGet<ResponseType>(
  path: string | null,
  action: RequestAction
) {
  const { data } = useSwr<ResponseType>(path ? [path, action] : null);
  return data;
}
