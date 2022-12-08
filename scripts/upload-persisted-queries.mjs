import { readFileSync } from 'fs';
import fetch from 'node-fetch';

if(process.env.NODE_ENV !=="production") {
  console.log("Skipping APQ Upload since you're running the command locally.");
  console.log("Please run the command with `NODE_ENV=production` to upload persisted queries.")

  process.exit(0);
}

const persistedQueries = readFileSync('./persisted_queries.json', {encoding: 'utf-8'});

const query = `
mutation UploadPersistedQueriesMutation($persistedQueries: String!) {
  uploadPersistedQueries(input: {persistedQueries: $persistedQueries}) {
    ... on UploadPersistedQueriesPayload {
      successMessage: message
    }
    ... on ErrNotAuthorized {
      errorMessage: message
    }
  }
}
`


const base64Encoded =  Buffer.from(`FrontendBuildAuth:${process.env.FRONTEND_APQ_UPLOAD_AUTH_TOKEN}`).toString('base64');

let start = Date.now();
fetch('http://localhost:4000/glry/graphql/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${base64Encoded}`
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
    if(response.data.uploadPersistedQueries.successMessage) {
      console.log(`Successfully uploaded persisted queries in ${Date.now() - start}ms`);
    } else {
      console.log("Something went wrong while uploading the persisted queries. Here's the full resposne");
      console.log(JSON.stringify(response, null, 2));
    }

  }).catch((error) => {
    console.error("There was an error while trying to upload the persisted queries.", error);

    process.exit(1);
});
