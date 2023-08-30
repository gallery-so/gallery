// eslint-disable-next-line @typescript-eslint/no-var-requires
const { z } = require('zod');

const EnvironmentSchema = z.object({
  ENV: z.string(),
  GRAPHQL_API_URL: z.string(),
  GRAPHQL_SUBSCRIPTION_URL: z.string(),
  MAGIC_LINK_PUBLIC_KEY: z.string(),
  MIXPANEL_API_URL: z.string(),
  MIXPANEL_TOKEN: z.string(),
});

module.exports = {
  EnvironmentSchema,
};
