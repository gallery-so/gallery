export const ROUTES = {
  ROOT: '/',
  HOME: '/home',
  AUTH: '/auth',
  USER: {
    ROOT: (username: string) => `/${username}`,
    COLLECTION: (username: string, collectionId: string) => `/${username}/${collectionId}`,
    COLLECTION_TOKEN: (username: string, collectionId: string, tokenId: string) =>
      `/${username}/${collectionId}/${tokenId}`,
  },
  MEMBERS: '/members',
  SHOP: '/shop',
  PRIVACY: '/privacy',
  TERMS: '/terms',
} as const;
