module.exports = {
  src: './',
  schema: './schema.graphql',
  language: 'typescript',
  artifactDirectory: './__generated__',
  customScalars: {
    Address: 'string',
  },
};
