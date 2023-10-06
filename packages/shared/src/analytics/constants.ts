export const contexts = {
  Posts: 'Posts',
  Feed: 'Feed',
  Editor: 'Editor',
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
  'Global Banner': 'Global Banner',
  'Global Announcement Popover': 'Global Announcement Popover',
  'Mobile App Upsell': 'Mobile App Upsell',
  Mementos: 'Mementos',
  'Merch Store': 'Merch Store',
} as const;

export type AnalyticsEventContextType = keyof typeof contexts;

export const flows = {
  'Web Signup Flow': 'Web Signup Flow',
  'Mobile Login Flow': 'Mobile Login Flow',
  'Web Sign Out Flow': 'Web Sign Out Flow',
  Twitter: 'Twitter',
  'Edit User Info': 'Edit User Info',
} as const;

export type AnalyticsEventFlowType = keyof typeof flows;
