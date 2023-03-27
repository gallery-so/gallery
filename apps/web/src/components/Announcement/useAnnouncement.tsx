import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { useAnnouncementFragment$key } from '~/generated/useAnnouncementFragment.graphql';
import { getTimeSince } from '~/shared/utils/time';

import { ANNOUNCEMENT_CONTENT } from './constants';

export default function useAnnoucement(queryRef: useAnnouncementFragment$key) {
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

  const announcements = useMemo(() => {
    const userExperiences = query.viewer?.userExperiences ?? [];
    const announcementsLists = ANNOUNCEMENT_CONTENT;

    return announcementsLists.map((announcement) => {
      return {
        ...announcement,
        time: announcement.date ? getTimeSince(announcement.date) : null,
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
