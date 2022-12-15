module.exports = {
  src: './',
  exclude: ['.next/**/*', 'node_modules/**/*'],
  schema: './schema.graphql',
  language: 'typescript',
  artifactDirectory: './__generated__',
  customScalars: {
    Email: 'string',
    Address: 'string',
    DBID: 'string',
  },
  persistConfig: {
    file: './persisted_queries.json',
    algorithm: 'SHA256', // this can be one of MD5, SHA256, SHA1
  },
};
