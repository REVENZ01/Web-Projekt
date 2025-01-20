const fastify = require('fastify')({ logger: true });

// Kunden-Routen
fastify.register(require('./routes/customers'), { prefix: '/customers' });
// Angebote-Routen


// Starten des Servers
const startServer = async () => {
  try {
    await fastify.listen({ port: 8080, host: '0.0.0.0' });
    fastify.log.info(`Server läuft auf http://localhost:8080`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

startServer();
