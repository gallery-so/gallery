import { graphql, readInlineData } from 'relay-runtime';

import { UserExperienceType } from '~/generated/enums';
import { isExperienceDismissedFragment$key } from '~/generated/isExperienceDismissedFragment.graphql';

export default function isExperienceDismissed(
  experience: UserExperienceType,
  queryRef: isExperienceDismissedFragment$key
) {
  const result = readInlineData(
    graphql`
      fragment isExperienceDismissedFragment on Query @inline {
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

  if (result.viewer?.__typename !== 'Viewer') {
    return true;
  }

  return Boolean(
    result.viewer?.userExperiences?.find((userExperience) => userExperience.type === experience)
      ?.experienced
  );
}
