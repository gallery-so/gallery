// higher level categories
export const contexts = {
  Posts: 'Posts',
  Feed: 'Feed',
  Explore: 'Explore',
  Editor: 'Editor',
  Social: 'Social',
  Notifications: 'Notifications',
  Authentication: 'Authentication',
  'Manage Wallets': 'Manage Wallets',
  Onboarding: 'Onboarding',
  Email: 'Email',
  Settings: 'Settings',
  'External Social': 'External Social',
  UserCollection: 'UserCollection',
  UserGallery: 'UserGallery',
  'NFT Detail': 'NFT Detail',
  Community: 'Community',
  Search: 'Search',
  'Global Banner': 'Global Banner',
  'Global Announcement Popover': 'Global Announcement Popover',
  'Mobile App Upsell': 'Mobile App Upsell',
  Mementos: 'Mementos',
  'Merch Store': 'Merch Store',
  'Hover Card': 'Hover Card',
  Changelog: 'Changelog',
  Error: 'Error',
  Maintenance: 'Maintenance',
  PFP: 'PFP',
  Toast: 'Toast',
  Navigation: 'Navigation',
  'Push Notifications': 'Push Notifications',
  Mention: 'Mention',
  Reply: 'Reply',
  Badge: 'Badge',
  Bookmarks: 'Bookmarks',
} as const;

export type AnalyticsEventContextType = keyof typeof contexts;

// the specific feature; the name of the flow should give you
// an instant visual of the steps for that flow
export const flows = {
  'Web Signup Flow': 'Web Signup Flow',
  'Mobile Login Flow': 'Mobile Login Flow',
  'Web Sign Out Flow': 'Web Sign Out Flow',
  Twitter: 'Twitter',
  'Edit User Info': 'Edit User Info',
  'Posts Beta Announcement': 'Posts Beta Announcement',
  'Share To Gallery': 'Share To Gallery',
  'Web Notifications Post Create Flow': 'Web Notifications Post Create Flow',
  'Web Sidebar Post Create Flow': 'Web Sidebar Post Create Flow',
  'Community Page Post Create Flow': 'Community Page Post Create Flow',
  'NFT Detail Page Post Create Flow': 'NFT Detail Page Post Create Flow',
  'Edit Gallery FLow': 'Edit Gallery FLow',
} as const;

export type AnalyticsEventFlowType = keyof typeof flows;
