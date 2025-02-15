const fastify = require("fastify")({ logger: true });
const cors = require("@fastify/cors");
const path = require("path");

// CORS aktivieren
fastify.register(cors, {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
});

// Multipart-Plugin registrieren, damit Datei-Uploads unterstützt werden
fastify.register(require("@fastify/multipart"));

// Statische Dateien aus dem Ordner "assets" bereitstellen
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "assets"),
  prefix: "/assets/",
});

// Routen registrieren
fastify.register(require("./routes/customers"), { prefix: "/customers" });
fastify.register(require("./routes/offers"), { prefix: "/offers" });
fastify.register(require("./routes/commentsRoutes"));
fastify.register(require("./routes/textDataRoutes"));

// Server starten
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

