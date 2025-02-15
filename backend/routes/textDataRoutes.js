const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const pump = require("util").promisify(require("stream").pipeline);
const db = require("../db");

// Promise-basierte Wrapper für SQLite-Methoden
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

async function fileRoutes(fastify, options) {
  // Definiert das Verzeichnis, in dem die Dateien gespeichert werden
  const assetsDir = path.join(__dirname, "..", "assets");
  await fs.promises.mkdir(assetsDir, { recursive: true });

  // POST-Endpoint: Datei-Upload für ein Angebot
  fastify.post("/offers/:offerId/files", async (request, reply) => {
    const { offerId } = request.params;
    // Mithilfe von fastify-multipart die hochgeladene Datei abrufen
    const data = await request.file();
    const originalName = data.filename;

    // Nur .txt-Dateien erlauben
    if (path.extname(originalName).toLowerCase() !== ".txt") {
      reply.status(400).send({ error: "Nur .txt Dateien werden unterstützt." });
      return;
    }

    try {
      const fileId = uuidv4();
      const storedFileName = `${fileId}.txt`;
      const filePath = path.join(assetsDir, storedFileName);

      // Datei speichern (Stream-Pipeline nutzen)
      await pump(data.file, fs.createWriteStream(filePath));

      // URL zum Abruf der Datei (Statische Bereitstellung via fastify-static)
      const fileUrl = `/assets/${storedFileName}`;
      const now = new Date().toISOString();

      // Dateimetadaten in der Datenbank speichern
      const insertSql = `
        INSERT INTO textdata (id, originalName, storedName, url, offerId, uploadedAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      await run(insertSql, [fileId, originalName, storedFileName, fileUrl, offerId, now]);

      // Neuen Datensatz abrufen
      const newFileEntry = await get("SELECT * FROM textdata WHERE id = ?", [fileId]);
      reply.send(newFileEntry);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Interner Serverfehler" });
    }
  });

  // GET-Endpoint: Alle Dateien für ein Angebot abrufen
  fastify.get("/offers/:offerId/files", async (request, reply) => {
    const { offerId } = request.params;
    try {
      const filesForOffer = await all(
        "SELECT id, originalName AS name, url FROM textdata WHERE offerId = ?",
        [offerId]
      );
      reply.send(filesForOffer);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Interner Serverfehler" });
    }
  });
}

module.exports = fileRoutes;

