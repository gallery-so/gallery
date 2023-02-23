import { useCallback, useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { UserExperienceType } from '~/generated/enums';
import { useExperienceFragment$key } from '~/generated/useExperienceFragment.graphql';
import useUpdateUserExperience from '~/utils/graphql/experiences/useUpdateUserExperience';

type Props = {
  type: UserExperienceType;
  queryRef: useExperienceFragment$key;
};

type userExperienceSetter = (p?: { experienced: boolean }) => Promise<void>;

export default function useExperience({ type, queryRef }: Props): [boolean, userExperienceSetter] {
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

  // by default, this callback will set the experienced state to `true`
  const updateUserExperience: userExperienceSetter = useCallback(
    async (props = { experienced: true }) => {
      if (!isLoggedIn) {
        return;
      }

      const { experienced } = props;

      const optimisticExperiencesList = userExperiences.map((experience) => {
        if (experience.type === type) {
          return {
            type,
            experienced,
          };
        }
        return experience;
      });

      return await update({ type, experienced, optimisticExperiencesList });
    },
    [isLoggedIn, userExperiences, update, type]
  );

  return [hasDismissedExperience, updateUserExperience];
}
