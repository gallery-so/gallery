// key: based on `UserExperienceType` schema

import { UserExperienceType } from '~/generated/enums';
import { GalleryElementTrackingProps } from '~/shared/contexts/AnalyticsContext';

export type AnnouncementType = {
  key: UserExperienceType;
  title: string;
  description: string;
  date: string;
  eventElementId: GalleryElementTrackingProps['eventElementId'];
  eventName: GalleryElementTrackingProps['eventName'];
  link: string;
  ctaText?: string;
};

export const ANNOUNCEMENT_CONTENT: AnnouncementType[] = [
  // TODO: for future notifications, pass in `eventElementId` and `eventName`.
  // we don't need to do this for older events because we don't display announcements
  // that are older than 30 days
  {
    key: 'MobileBetaUpsell',
    title: 'The Wait is Over!',
    description: 'Download the Gallery Mobile App and take your collection everywhere.',
    date: '2023-06-20T16:00:00.154845Z',
    link: '/mobile',
    ctaText: 'Download',
    eventElementId: null,
    eventName: null,
  },
  // older notifications
  {
    key: 'MobileUpsell1',
    title: 'The Gallery Mobile App',
    description:
      'The waitlist for the Gallery mobile app is now open. Claim your spot now and be among the first to experience effortless browsing and the magic of the creative web in your pocket.',
    date: '2023-05-08T16:00:00.154845Z',
    link: '/mobile',
    eventElementId: null,
    eventName: null,
  },
  {
    key: 'UpsellGallerySelects1',
    title: 'Introducing Gallery Selects',
    description:
      '🌸 Submit a gallery in the vibrant spirit of Spring for a chance to win an exclusive 1-of-1 NFT and merch bundle.',
    date: '2023-04-10T13:00:00.154845Z',
    link: 'https://gallery.mirror.xyz/GzEODA-g4mvdb1onS1jSRMSKqfMoGJCNu5yOSTV9RM8',
    eventElementId: null,
    eventName: null,
  },
  {
    key: 'UpsellMintMemento4',
    title: 'Now Minting: Blooming Connections',
    description:
      'Gallery Memento #4 is now available for minting, a beautiful and symbolic representation of the growing network within the Gallery community.',
    date: '2023-03-27T13:00:00.154845Z',
    link: '/mint/mementos',
    eventElementId: null,
    eventName: null,
  },
];
