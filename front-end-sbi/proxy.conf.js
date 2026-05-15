// Proxy API routes to Go backend — bypass GET requests (Angular navigation)
const API_TARGET = 'http://api:4000';

const apiRoutes = ['/country', '/pax', '/order', '/usuario', '/busqueda', '/contactos', '/archivo', '/upload', '/login'];

const bypassGet = (req) => req.method === 'GET' ? req.url : null;

const config = {};
apiRoutes.forEach(route => {
  config[route] = {
    target: API_TARGET,
    secure: false,
    changeOrigin: true,
    bypass: bypassGet,
  };
});

module.exports = config;
