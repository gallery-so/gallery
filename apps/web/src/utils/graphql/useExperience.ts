import { useCallback, useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import useUpdateUserExperience from '~/components/GalleryEditor/GalleryOnboardingGuide/useUpdateUserExperience';
import { UserExperienceType } from '~/generated/enums';
import { useExperienceFragment$key } from '~/generated/useExperienceFragment.graphql';

type Props = {
  type: UserExperienceType;
  queryRef: useExperienceFragment$key;
};

type updateUserExperienceProps = {
  type: UserExperienceType;
  experienced: boolean;
};

export default function useExperience({ type, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment useExperienceFragment on Query {
        viewer {
          ... on Viewer {
            __typename
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

  const isLoggedIn = query.viewer?.__typename === 'Viewer';

  const userExperiences = useMemo(() => {
    if (isLoggedIn) {
      return query.viewer.userExperiences ?? [];
    }
    return [];
  }, [isLoggedIn, query.viewer]);

  const hasDismissedExperience = useMemo(() => {
    if (!isLoggedIn) {
      return true;
    }

    return Boolean(
      userExperiences.find((userExperience) => userExperience.type === type)?.experienced
    );
  }, [isLoggedIn, userExperiences, type]);

  const update = useUpdateUserExperience();

  const updateUserExperience = useCallback(
    async ({ type, experienced }: updateUserExperienceProps) => {
      if (!isLoggedIn) {
        return;
      }

      const optimisticExperiencesList = userExperiences.map((experience) => {
        if (experience.type === type) {
          return {
            type,
            experienced: experienced,
          };
        }
        return experience;
      });

      return await update({ type, experienced, optimisticExperiencesList });
    },
    [isLoggedIn, userExperiences, update]
  );

  return [hasDismissedExperience, updateUserExperience];
}
