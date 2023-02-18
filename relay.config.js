const path = require("path");

function generateConfig(projectDir) {
  return {
    schema: "schema.graphql",
    language: "typescript",
    output: path.join(projectDir, "__generated__", "relay"),

    customScalarTypes: {
      Email: "string",
      Address: "string",
      DBID: "string",
    },

    persist: {
      file: "persisted_queries.json",
      algorithm: "SHA256", // this can be one of MD5, SHA256, SHA1
    },
  };
}

module.exports = {
  root: __dirname,
  sources: {
    "apps/web": "web",
    "apps/mobile": "mobile",

    // This means web, mobile, and the shared package can use fragments from the shared package.
    "packages/shared": ["web", "mobile", "shared"],
  },
  projects: {
    web: generateConfig("apps/web"),
    mobile: generateConfig("apps/mobile"),
    shared: generateConfig("packages/shared"),
  },
};
