const fastify = require("fastify")({ logger: true });
const cors = require("@fastify/cors");
const path = require("path");

// CORS aktivieren
fastify.register(cors, {
  origin: "http://localhost:3000", // Erlaubt Anfragen von diesem Frontend
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Erlaubte HTTP-Methoden
});

// Multipart-Plugin registrieren, damit Datei-Uploads unterstützt werden
fastify.register(require("@fastify/multipart"));

// Statische Dateien aus dem Ordner "assets" bereitstellen
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "assets"),
  prefix: "/assets/", // URL-Pfad, unter dem die Dateien erreichbar sind
});

// Kunden-Routen
fastify.register(require("./routes/customers"), { prefix: "/customers" });

// Angebote-Routen
fastify.register(require("./routes/offers"), { prefix: "/offers" });

// Kommentare-Routen
fastify.register(require("./routes/commentsRoutes"));

// TextData-Routen (für Datei-Upload und -Abruf)
fastify.register(require("./routes/textDataRoutes"));

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
