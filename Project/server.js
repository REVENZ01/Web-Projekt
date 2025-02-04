const fastify = require("fastify")({ logger: true });
const cors = require("@fastify/cors");

// CORS aktivieren
fastify.register(cors, {
  origin: "http://localhost:3000", // Erlaubt Anfragen von diesem Frontend
  methods: ["GET", "POST", "PUT", "DELETE"], // Erlaubte HTTP-Methoden
});

// Kunden-Routen
fastify.register(require("./routes/customers"), { prefix: "/customers" });
// Angebote-Routen
fastify.register(require("./routes/offers"), { prefix: "/offers" });
// Kommentare-Routen (NEU!)
fastify.register(require("./routes/commentsRoutes"));

// Starten des Servers
const startServer = async () => {
  try {
    await fastify.listen({ port: 8080, host: "0.0.0.0" });
    fastify.log.info(`Server läuft auf http://localhost:8080`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

startServer();
