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
};
