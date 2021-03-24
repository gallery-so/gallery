const { createProxyMiddleware } = require('http-proxy-middleware');

const baseurl =
  process.env.ENV === 'production'
    ? 'https://api.gallery.so'
    : 'http://localhost:4000';

module.exports = function (app) {
  console.log(process.env);
  app.use(
    '/api',
    createProxyMiddleware({
      target: baseurl,
      changeOrigin: true,
    })
  );
};
