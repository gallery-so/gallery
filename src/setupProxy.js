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
    })
  );
};
