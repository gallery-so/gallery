import { render, cleanup } from '@testing-library/react';
import NavActionFollow from './NavActionFollow';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { useFragment, useLazyLoadQuery, useRelayEnvironment } from 'react-relay/hooks';
// import { graphql } from 'react-relay';

import graphql from 'babel-plugin-relay/macro';

const mockResolver = {
  User: (): any => ({
    id: 'id',
  }),
};

afterEach(cleanup);
test('', () => {
  // const Environment = useRelayEnvironment();
  const environment = createMockEnvironment();

  const data = useLazyLoadQuery(
    graphql`
      query NavActionFollowTestQuery @relay_test_operation {
        ...NavActionFollowQueryFragment
      }
    `,
    {}
  );

  const { getByText } = render(<NavActionFollow userRef={queryRef.user} queryRef={queryRef} />);

  environment.mock.resolveMostRecentOperation((operation) =>
    MockPayloadGenerator.generate(operation, mockResolver)
  );
});

// describe('NavActionFollow', () => {

// not signed in, it says "sign in " and button is disabled
// signed in and viewing my own profile - button is disabled
// signed in and viewing someone else's profile - button is enabled
// - following
// - not following
// });
