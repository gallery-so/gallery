const { createProxyMiddleware } = require('http-proxy-middleware');
const checkPort = require('./checkPort');
const router = require('./routes');

function getBaseUrl() {
  return process.env.API_URL;
  // switch (process.env.ENV) {
  //   case 'production':
  //     return process.env.BASEURL_PRODUCTION;
  //   case 'dev':
  //     return process.env.BASEURL_DEVELOPMENT;
  //   case 'hack':
  //     return process.env.BASEURL_HACK;
  //   case 'local':
  //   default:
  //     return process.env.BASEURL_LOCAL;
  // }
}

const baseurl = getBaseUrl();

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: baseurl,
      changeOrigin: true,
      pathRewrite: {
        // drop `/api` from path prefix, since its only purpose is to route local requests here
        '^/api': '/',
      },
    })
  );
};

/**
 * local mockserver for mocking data / endpoints not yet available on the backend.
 * example lifecycle:
 *   1) useSwr('/users')                         // react component
 *   2) http://localhost:3000/api/glry/v1/users  // fetch configured in SwrContext.tsx
 *   3) http://localhost:4000/users              // proxy rewrite in current file
 *
 * TODO: allow local development to communicate directly with production AWS servers.
 *       this will probably just be an extra flag when starting the app
 */
if (process.env.ENV === 'local') {
  checkPort(process.env.SERVER_PORT)
    .then(() => {
      console.log('Running against local mock server');
      initializeMockServer();
    })
    .catch((e) => {
      if (e.code === 'EADDRINUSE') {
        console.log('Running against local backend');
        return;
      }
      console.log('Error initializing mock server:', e);
    });
}

function initializeMockServer() {
  const express = require('express');
  const mockServer = express();
  const port = process.env.SERVER_PORT;

  mockServer.use(function (req, res, next) {
    // artificial latency
    setTimeout(next, 1000);
  });

  mockServer.listen(port, () => {
    console.log(`test server initialized at http://localhost:${port}`);
  });

  // $ curl http://localhost:4000/health
  mockServer.get('/health', (req, res) => {
    res.send('test server is live');
  });

  mockServer.use('/glry/v1', router);
}
