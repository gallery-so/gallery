import { graphql, readInlineData } from 'relay-runtime';

import { getObjectNameFragment$key } from '~/generated/getObjectNameFragment.graphql';

const MERCHS_NAMING = {
  TShirt: '(OBJECT 001) Shirt',
  Hat: '(OBJECT 002) Hat',
  Card: '(OBJECT 003) Card ',
};

export function getObjectName(merchTokenRef: getObjectNameFragment$key) {
  const token = readInlineData(
    graphql`
      fragment getObjectNameFragment on MerchToken @inline {
        objectType
      }
    `,
    merchTokenRef
  );

  if (token.objectType in MERCHS_NAMING) {
    // We safe guarded above so it's okay to ignore this here
    // @ts-expect-error https://stackoverflow.com/questions/57928920/typescript-narrowing-of-keys-in-objects-when-passed-to-function
    return MERCHS_NAMING[token.objectType];
  }

  return '(OBJECT 000) Unknown';
}
