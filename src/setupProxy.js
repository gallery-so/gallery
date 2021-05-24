const { createProxyMiddleware } = require('http-proxy-middleware');

const baseurl =
  process.env.ENV === 'production'
    ? process.env.BASEURL_PRODUCTION
    : process.env.BASEURL_DEVELOPMENT;

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: baseurl,
      changeOrigin: true,
      pathRewrite: {
        // drop `/api/glry/v1` from path prefix
        '^/api/glry/v1': '/',
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
if (process.env.MOCK === 'true') {
  initializeMockServer();
}

const MOCK_DB = {
  users: [
    {
      id: 'PAoGbFB6OQtZ6mWI/BYyLA==',
      creationTime: Date.now(),
      username: 'dcinvestor',
      diplayName: 'DCInvestor',
      description:
        'French Graphic Designer + Digital Artist Sparkles Founder of @healthedeal\nSparkles lorem ipsum sit dolor http://superrare.co/maalavidaa Sparkles Shop\n& More → http://linktr.ee/maalavidaa',
      addresses: ['0xDC25EF3F5B8A186998338A2ADA83795FBA2D695E'],
    },
  ],
};

function initializeMockServer() {
  const express = require('express');
  const mockServer = express();
  const port = 4000;

  mockServer.use(function (req, res, next) {
    setTimeout(next, 1000);
  });

  mockServer.listen(port, () => {
    console.log(`test server initialized at http://localhost:${port}`);
  });

  // $ curl http://localhost:4000/health
  mockServer.get('/health', (req, res) => {
    res.send('test server is live');
  });

  mockServer.get('/users/get', (req, res) => {
    const { query } = req;
    if (query.username) {
      const user = MOCK_DB.users.find(
        (user) => user.username === query.username
      );
      if (user) {
        res.json(user);
        return;
      }
    }
    if (query.address) {
      const user = MOCK_DB.users.find((user) => user.address === query.address);
      if (user) {
        res.json(user);
        return;
      }
    }
    res.json({
      error: 'ERR_USER_NOT_FOUND',
    });
  });
}
