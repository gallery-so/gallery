const fs = require('fs');
const path = require('path');

function generateConfig(projectDir) {
  const generatedDirectory = path.join(projectDir, '__generated__', 'relay');
  const persistedQueriesFile = path.join(projectDir, 'persisted_queries.json');

  // Automatically touch the generated directory
  fs.mkdirSync(path.resolve(__dirname, generatedDirectory), {
    recursive: true,
  });

  // Automatically touch the persisted_queries file
  fs.writeFileSync(path.resolve(__dirname, persistedQueriesFile), '{}', 'utf-8');

  return {
    schema: 'schema.graphql',
    language: 'typescript',
    output: generatedDirectory,

    customScalarTypes: {
      Email: 'string',
      Address: 'string',
      DBID: 'string',
    },

    persist:
      // Disable APQ for mobile
      projectDir === 'apps/mobile'
        ? undefined
        : {
            file: path.resolve(__dirname, persistedQueriesFile),
            algorithm: 'SHA256', // this can be one of MD5, SHA256, SHA1
          },
  };
}

module.exports = {
  root: __dirname,
  sources: {
    'apps/web': 'web',
    'apps/mobile': 'mobile',

    // This means web, mobile, and the shared package can use fragments from the shared package.
    'packages/shared': ['web', 'mobile', 'shared'],
  },
  projects: {
    web: generateConfig('apps/web'),
    mobile: generateConfig('apps/mobile'),
    shared: generateConfig('packages/shared'),
  },
};
