const {createProxyMiddleware} = require('http-proxy-middleware');
const router = require('./routes');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.MOCK_SERVER_BASE_URL,
      changeOrigin: true,
      pathRewrite: {
        // Drop `/api` from path prefix, since its only purpose is to route local requests here
        '^/api': '/',
      },
    }),
  );
};

/**
 * Local mockserver for mocking data / endpoints not yet available on the backend.
 * example lifecycle:
 *   1) useSwr('/users')                         // react component
 *   2) http://localhost:3000/api/glry/v1/users  // fetch configured in SwrContext.tsx
 *   3) http://localhost:3500/users              // proxy rewrite in current file
 *
 * TODO: allow local development to communicate directly with production AWS servers.
 *       this will probably just be an extra flag when starting the app
 */
if (process.env.ENV === 'local') {
  initializeMockServer();
}

function initializeMockServer() {
  const express = require('express');
  const mockServer = express();
  const port = process.env.MOCK_SERVER_PORT;

  mockServer.use((request, res, next) => {
    // Artificial latency
    setTimeout(next, 1000);
  });

  mockServer.listen(port, () => {
    console.log(`test server initialized at http://localhost:${port}`);
  });

  // $ curl http://localhost:3500/health
  mockServer.get('/health', (request, res) => {
    res.send('test server is live');
  });

  mockServer.use('/glry/v1', router);
}
