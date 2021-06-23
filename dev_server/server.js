const { createProxyMiddleware } = require('http-proxy-middleware');
const checkPort = require('./checkPort');
const MOCK_DB = require('./mocks');

function getBaseUrl() {
  switch (process.env.ENV) {
    case 'production':
      return process.env.BASEURL_PRODUCTION;
    case 'dev':
      return process.env.BASEURL_DEVELOPMENT;
    case 'hack':
      return process.env.BASEURL_HACK;
    case 'local':
    default:
      return process.env.BASEURL_LOCAL;
  }
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
    .catch(() => console.log('Running against local backend'));
}

function initializeMockServer() {
  const express = require('express');
  const mockServer = express();
  const port = process.env.SERVER_PORT;

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
    if (query.id) {
      const user = MOCK_DB.users.find((user) => user.id === query.id);
      if (user) {
        res.json({ data: user });
        return;
      }
    }
    if (query.username) {
      const user = MOCK_DB.users.find(
        (user) => user.username === query.username
      );
      if (user) {
        res.json({ data: user });
        return;
      }
    }
    if (query.address) {
      const user = MOCK_DB.users.find((user) => user.address === query.address);
      if (user) {
        res.json({ data: user });
        return;
      }
    }
    res.json({
      error: 'ERR_USER_NOT_FOUND',
    });
  });

  mockServer.get('/collections/get', (req, res) => {
    const { query } = req;
    // TODO
    // return hidden collections if req.get('Authentication') matches the requested user
    const user = MOCK_DB.users.find((user) => user.username === query.username);
    if (!user) {
      res.json({
        error: 'ERR_NO_COLLECTIONS_FOUND_FOR_USER',
      });
      return;
    }
    const collectionsForUser = MOCK_DB.collections.filter(
      (collection) => collection.ownerUserId === user.id
    );
    if (collectionsForUser.length) {
      res.json({
        data: {
          collections: collectionsForUser,
        },
      });
      return;
    }
    res.json({
      error: 'ERR_NO_COLLECTIONS_FOUND_FOR_USER',
    });
  });

  mockServer.get('/nfts/get', (req, res) => {
    const { query } = req;
    const nft = MOCK_DB.nfts.find((nft) => nft.id === query.id);
    if (!nft) {
      res.json({
        error: 'ERR_NFT_NOT_FOUND',
      });
      return;
    }
    res.json({ data: nft });
    return;
  });

  mockServer.get('/auth/get_preflight', (req, res) => {
    const { query } = req;
    console.log(query);
    res.json({
      data: {
        nonce: '1234',
        user_exists: false,
      },
    });
    return;
  });

  mockServer.post('/users/login', (req, res) => {
    const { query } = req;
    res.json({
      data: {
        sig_valid: true,
        jwt_token: 'token',
        user_id: 'PAoGbFB6OQtZ6mWI/BYyLA==',
      },
    });
    return;
  });

  mockServer.post('/users/create', (req, res) => {
    const { query } = req;
    res.json({
      data: {
        sig_valid: true,
        jwt_token: 'token',
        user_id: 'PAoGbFB6OQtZ6mWI/BYyLA==',
      },
    });
    return;
  });
}
