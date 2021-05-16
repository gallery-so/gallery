export default function isPromise(entity: any) {
  return typeof entity === 'object' && 'then' in entity;
}
