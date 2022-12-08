import { readFileSync } from 'fs';
import fetch from 'node-fetch';

const persistedQueries = readFileSync('./persisted_queries.json', {encoding: 'utf-8'});

const query = `
mutation UploadPersistedQueriesMutation($persistedQueries: String!) {
  uploadPersistedQueries(input: {persistedQueries: $persistedQueries}) {
    ... on UploadPersistedQueriesPayload {
      message
    }
  }
}
`


fetch('http://localhost:4000/glry/graphql/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    variables: {
      persistedQueries,
    },
    query,
  }),
})
  .then((response) => response.json())
  .then((response) => {
    console.log(JSON.stringify(response, null, 2));
  });
