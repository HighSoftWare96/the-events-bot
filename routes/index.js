const fp = require('fastify-plugin');

function plugin(fastify, opts, done) {
  done();
}

module.exports = fp(plugin);
