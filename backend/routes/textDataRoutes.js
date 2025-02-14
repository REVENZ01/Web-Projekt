// routes/textDataRoutes.js
const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const pump = require("util").promisify(require("stream").pipeline);

async function fileRoutes(fastify, options) {
  // Definiert das Verzeichnis, in dem die Dateien gespeichert werden
  const assetsDir = path.join(__dirname, "..", "assets");
  await fsPromises.mkdir(assetsDir, { recursive: true });

  // Pfad zur JSON-Datei, in der Dateimetadaten gespeichert werden
  const dataFilePath = path.join(__dirname, "../data/textdata.json");

  // Hilfsfunktionen zum Laden und Speichern der Dateimetadaten
  async function loadFileData() {
    try {
      const data = await fsPromises.readFile(dataFilePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async function saveFileData(data) {
    await fsPromises.writeFile(dataFilePath, JSON.stringify(data, null, 2));
  }

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

      // Dateimetadaten in der JSON-Datei speichern
      const fileData = await loadFileData();
      const newFileEntry = {
        id: fileId,
        originalName,
        storedName: storedFileName,
        url: fileUrl,
        offerId,
        uploadedAt: new Date().toISOString(),
      };
      fileData.push(newFileEntry);
      await saveFileData(fileData);

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
      const fileData = await loadFileData();
      const filesForOffer = fileData.filter((file) => file.offerId === offerId);
      const responseData = filesForOffer.map((file) => ({
        id: file.id,
        name: file.originalName,
        url: file.url,
      }));
      reply.send(responseData);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Interner Serverfehler" });
    }
  });
}

module.exports = fileRoutes;
