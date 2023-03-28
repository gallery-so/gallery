import { Route } from 'nextjs-routes';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import {
  useAnnouncementFragment$key,
  UserExperienceType,
} from '~/generated/useAnnouncementFragment.graphql';
import { getTimeSince } from '~/shared/utils/time';

import { ANNOUNCEMENT_CONTENT } from './constants';

export type AnnouncementType = {
  key: UserExperienceType;
  title: string;
  description: string;
  date: string;
  time: string | null; // time since date
  experienced: boolean;
  link?: Route;
};

export default function useAnnouncement(queryRef: useAnnouncementFragment$key) {
  const query = useFragment(
    graphql`
      fragment useAnnouncementFragment on Query {
        viewer {
          ... on Viewer {
            userExperiences {
              type
              experienced
            }
          }
        }
      }
    `,
    queryRef
  );

  const announcements = useMemo<AnnouncementType[]>(() => {
    const userExperiences = query.viewer?.userExperiences ?? [];
    const announcementsLists = ANNOUNCEMENT_CONTENT;

    return announcementsLists.map((announcement) => {
      return {
        ...announcement,
        key: announcement.key as UserExperienceType,
        time: announcement.date ? getTimeSince(announcement.date) : null,
        link: {
          pathname: announcement.link,
        } as Route,
        experienced: userExperiences.some(
          (userExperience) => userExperience.type === announcement.key && userExperience.experienced
        ),
      };
    });
  }, [query.viewer?.userExperiences]);

  return {
    announcements,
    totalUnreadAnnouncements: announcements.filter((announcement) => !announcement.experienced)
      .length,
  };
}
