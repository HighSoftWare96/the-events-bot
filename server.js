const fastify = require('fastify');
const autoload = require('fastify-autoload');
const path = require('path');

const PORT = process.env.PORT || 3000;

const app = fastify();

app.register(autoload, {
  dir: path.join(__dirname, 'plugins'),
});

app.register(autoload, {
  dir: path.join(__dirname, 'routes'),
  options: { path: '/api' },
});

app.listen(PORT).then(() => {
  console.log('Listening on port', PORT);
  console.log(app.printRoutes());
});
