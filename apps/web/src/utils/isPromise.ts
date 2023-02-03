export default function isPromise(entity: unknown): entity is Promise<unknown> {
  if (entity) {
    return typeof entity === 'object' && 'then' in entity;
  }

  return false;
}
