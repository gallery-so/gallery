import { Route } from 'nextjs-routes';

type BaseSearchItem = {
  label: string;
  value: string;
};

type UserSearchItem = BaseSearchItem & {
  type: 'User';
};

type GallerySearchItem = BaseSearchItem & {
  type: 'Gallery';
  owner: string;
};

type CommunitySearchItem = BaseSearchItem & {
  type: 'Community';
  communityPageUrl: Route;
};

export type SearchItemType = UserSearchItem | GallerySearchItem | CommunitySearchItem;

export type SearchResultVariant = 'default' | 'compact';
