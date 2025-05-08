const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '' // remove /api prefix when forwarding to backend
      },
      onProxyRes: function(proxyRes, req, res) {
        // Log proxy response status for debugging
        console.log('Proxy response status:', proxyRes.statusCode);
      }
    })
  );
}; 