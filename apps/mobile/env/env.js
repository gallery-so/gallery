// eslint-disable-next-line @typescript-eslint/no-var-requires
const { z } = require('zod');

const EnvironmentSchema = z.object({
  EXPO_PUBLIC_ENV: z.string(),
  EXPO_PUBLIC_GRAPHQL_API_URL: z.string(),
  EXPO_PUBLIC_GRAPHQL_SUBSCRIPTION_URL: z.string(),
  EXPO_PUBLIC_MAGIC_LINK_PUBLIC_KEY: z.string(),
  EXPO_PUBLIC_MIXPANEL_API_URL: z.string(),
  EXPO_PUBLIC_MIXPANEL_TOKEN: z.string(),
  EXPO_PUBLIC_FORMSPREE_ID: z.string(),
  EXPO_PUBLIC_SANITY_PROJECT_ID: z.string(),
  EXPO_PUBLIC_FORMSPEE_REQUEST_COLLECTION_ID: z.string(),
});

module.exports = {
  EnvironmentSchema,
};
