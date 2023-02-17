const path = require("path");

module.exports = {
  src: "./",
  exclude: [".next/**/*", "node_modules/**/*"],
  schema: path.resolve(__dirname, "schema.graphql"),
  language: "typescript",
  artifactDirectory: path.join(process.cwd(), "__generated__"),
  customScalars: {
    Email: "string",
    Address: "string",
    DBID: "string",
  },
  persistConfig: {
    file: path.join(process.cwd(), "persisted_queries.json"),
    algorithm: "SHA256", // this can be one of MD5, SHA256, SHA1
  },
};
