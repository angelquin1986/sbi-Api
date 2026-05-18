// Proxy API routes to Go backend — bypass GET requests (Angular navigation)
const API_TARGET = 'http://api:4000';

const apiRoutes = ['/country', '/pax', '/order', '/usuario', '/busqueda', '/contactos', '/archivo', '/upload'];

const bypassGet = (req) => req.method === 'GET' ? req.url : null;

const config = {};
apiRoutes.forEach(route => {
  config[route] = {
    target: API_TARGET,
    secure: false,
    changeOrigin: true,
  };
});

module.exports = config;
