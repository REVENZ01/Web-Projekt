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

// In-Memory Storage für Long Running Tasks
// Datenmodell: { id, status (Pending, Completed), payload (Ergebnis), tags, substring, caseInsensitive }
const tasks = {};

// Hauptfunktion, welche die Routen definiert
async function fileRoutes(fastify, options) {
  // Verzeichnis für die gespeicherten Dateien
  const assetsDir = path.join(__dirname, "..", "assets");
  await fs.promises.mkdir(assetsDir, { recursive: true });

  // POST-Endpoint: Datei-Upload für ein Angebot  
  // Hier wird die Spalte "tag" als leeres JSON-Array initialisiert.
  fastify.post("/offers/:offerId/files", async (request, reply) => {
    const { offerId } = request.params;
    const data = await request.file();
    const originalName = data.filename;

    if (path.extname(originalName).toLowerCase() !== ".txt") {
      reply.status(400).send({ error: "Nur .txt Dateien werden unterstützt." });
      return;
    }

    try {
      const fileId = uuidv4();
      const storedFileName = `${fileId}.txt`;
      const filePath = path.join(assetsDir, storedFileName);

      await pump(data.file, fs.createWriteStream(filePath));

      const fileUrl = `/assets/${storedFileName}`;
      const now = new Date().toISOString();

      // In der Datenbank entspricht die Spaltenreihenfolge der Setup-Datei.
      const insertSql = `
        INSERT INTO textdata (id, originalName, storedName, tag, url, offerId, uploadedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      // "tag" initial als leeres JSON-Array speichern.
      await run(insertSql, [fileId, originalName, storedFileName, "[]", fileUrl, offerId, now]);

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
        "SELECT id, originalName AS name, url, tag FROM textdata WHERE offerId = ?",
        [offerId]
      );
      reply.send(filesForOffer);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Interner Serverfehler" });
    }
  });

  // GET-Endpoint: Alle Tags für ein bestimmtes Textdokument abrufen
  fastify.get("/offers/:offerId/files/:fileId/tags", async (request, reply) => {
    const { offerId, fileId } = request.params;
    try {
      const file = await get(
        "SELECT tag FROM textdata WHERE id = ? AND offerId = ?",
        [fileId, offerId]
      );
      let tags = [];
      if (file && file.tag) {
        try {
          tags = JSON.parse(file.tag);
        } catch (e) {
          tags = [];
        }
      }
      reply.send(tags);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Interner Serverfehler" });
    }
  });

  // POST-Endpoint: Neuen Tag für ein Textdokument hinzufügen
  fastify.post("/offers/:offerId/files/:fileId/tags", async (request, reply) => {
    const { offerId, fileId } = request.params;
    const { text } = request.body;
    if (!text || !text.trim()) {
      reply.status(400).send({ error: "Tag-Text darf nicht leer sein." });
      return;
    }
    try {
      const file = await get(
        "SELECT tag FROM textdata WHERE id = ? AND offerId = ?",
        [fileId, offerId]
      );
      let tags = [];
      if (file && file.tag) {
        try {
          tags = JSON.parse(file.tag);
        } catch (e) {
          tags = [];
        }
      }
      const newTag = { id: uuidv4(), text: text.trim() };
      tags.push(newTag);
      await run(
        "UPDATE textdata SET tag = ? WHERE id = ? AND offerId = ?",
        [JSON.stringify(tags), fileId, offerId]
      );
      reply.send(newTag);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Interner Serverfehler" });
    }
  });

  // PUT-Endpoint: Einen bestehenden Tag bearbeiten
  fastify.put("/offers/:offerId/files/:fileId/tags/:tagId", async (request, reply) => {
    const { offerId, fileId, tagId } = request.params;
    const { text } = request.body;
    if (!text || !text.trim()) {
      reply.status(400).send({ error: "Tag-Text darf nicht leer sein." });
      return;
    }
    try {
      const file = await get(
        "SELECT tag FROM textdata WHERE id = ? AND offerId = ?",
        [fileId, offerId]
      );
      let tags = [];
      if (file && file.tag) {
        try {
          tags = JSON.parse(file.tag);
        } catch (e) {
          tags = [];
        }
      }
      let updatedTag = null;
      tags = tags.map(tag => {
        if (tag.id === tagId) {
          updatedTag = { id: tag.id, text: text.trim() };
          return updatedTag;
        }
        return tag;
      });
      if (!updatedTag) {
        reply.status(404).send({ error: "Tag nicht gefunden." });
        return;
      }
      await run(
        "UPDATE textdata SET tag = ? WHERE id = ? AND offerId = ?",
        [JSON.stringify(tags), fileId, offerId]
      );
      reply.send(updatedTag);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Interner Serverfehler" });
    }
  });

  // DELETE-Endpoint: Einen Tag löschen
  fastify.delete("/offers/:offerId/files/:fileId/tags/:tagId", async (request, reply) => {
    const { offerId, fileId, tagId } = request.params;
    try {
      const file = await get(
        "SELECT tag FROM textdata WHERE id = ? AND offerId = ?",
        [fileId, offerId]
      );
      let tags = [];
      if (file && file.tag) {
        try {
          tags = JSON.parse(file.tag);
        } catch (e) {
          tags = [];
        }
      }
      const initialLength = tags.length;
      tags = tags.filter(tag => tag.id !== tagId);
      if (tags.length === initialLength) {
        reply.status(404).send({ error: "Tag nicht gefunden." });
        return;
      }
      await run(
        "UPDATE textdata SET tag = ? WHERE id = ? AND offerId = ?",
        [JSON.stringify(tags), fileId, offerId]
      );
      reply.send({ success: true });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Interner Serverfehler" });
    }
  });

  // =====================================================================
  // Neue Schnittstelle: Verarbeitung von Tags als Long Running Operation
  // =====================================================================

  /**
   * POST /tags/search
   * Erwartet im Body: { tags: [ "tag1", "tag2", ... ], substring: boolean, caseInsensitive: boolean }
   * Startet eine Long Running Operation, die alle Dateien sucht, die alle angegebenen Tags enthalten.
   * Antwortet sofort mit einem 202 Status Code und einer Task ID.
   */
  fastify.post("/tags/search", async (request, reply) => {
    const { tags, substring, caseInsensitive } = request.body;
    if (!Array.isArray(tags) || tags.length === 0) {
      reply.status(400).send({ error: "Bitte geben Sie eine Liste von Tags an." });
      return;
    }
    const taskId = uuidv4();
    // Task initialisieren mit Status "Pending" und den gesuchten Tags sowie den Suchparametern speichern
    tasks[taskId] = { id: taskId, status: "Pending", payload: null, tags, substring, caseInsensitive };

    // Simuliere eine Long Running Operation (60 Sekunden Verzögerung)
    setTimeout(async () => {
      try {
        // Hole alle Dateien mit Tags aus der Datenbank
        const rows = await all("SELECT id, originalName AS name, url, tag FROM textdata");
        // Filtere Dateien, die alle angefragten Tags enthalten
        const matchingFiles = rows.filter(row => {
          let fileTags = [];
          if (row.tag) {
            try {
              fileTags = JSON.parse(row.tag);
            } catch (e) {
              fileTags = [];
            }
          }
          // Extrahiere die Tag-Texte aus den gespeicherten Tag-Objekten
          const fileTagTexts = fileTags.map(t => t.text);

          // Filterlogik:
          // - Wenn substring und caseInsensitive true sind, suche case-insensitive als Teilstring.
          // - Falls nur substring true ist, suche als Teilstring (case-sensitive).
          // - Falls nur caseInsensitive true ist, vergleiche case-insensitive auf exakte Übereinstimmung.
          // - Andernfalls erwarte exakte Übereinstimmung.
          if (substring && caseInsensitive) {
            return tags.every(searchTag =>
              fileTagTexts.some(fileTag =>
                fileTag.toLowerCase().includes(searchTag.toLowerCase())
              )
            );
          } else if (substring) {
            return tags.every(searchTag =>
              fileTagTexts.some(fileTag =>
                fileTag.includes(searchTag)
              )
            );
          } else if (caseInsensitive) {
            return tags.every(searchTag =>
              fileTagTexts.some(fileTag =>
                fileTag.toLowerCase() === searchTag.toLowerCase()
              )
            );
          } else {
            return tags.every(searchTag =>
              fileTagTexts.includes(searchTag)
            );
          }
        });
        tasks[taskId].payload = matchingFiles;
        tasks[taskId].status = "Completed";
      } catch (error) {
        tasks[taskId].payload = { error: "Fehler bei der Verarbeitung." };
        tasks[taskId].status = "Completed";
      }
    }, 60000); // 60 Sekunden

    // Sofortige Antwort mit Task ID und Status 202
    reply.status(202).send({ taskId });
  });

  /**
   * GET /tags/search/:taskId
   * Mit dieser Schnittstelle kann der Client den Status der Long Running Operation abfragen.
   * - Solange die Operation läuft, wird ein 202 Status Code mit dem aktuellen Status zurückgegeben.
   * - Ist die Operation abgeschlossen, wird ein 200 Status Code mit dem Ergebnis (Liste der Dateien) geliefert.
   */
  fastify.get("/tags/search/:taskId", async (request, reply) => {
    const { taskId } = request.params;
    const task = tasks[taskId];
    if (!task) {
      reply.status(404).send({ error: "Task nicht gefunden." });
      return;
    }
    if (task.status !== "Completed") {
      // Operation läuft noch, Antwort mit Status 202 und aktuellem Task-Status
      reply.status(202).send({ taskId: task.id, status: task.status });
      return;
    }
    // Operation abgeschlossen, Rückgabe des Ergebnisses mit Status 200
    reply.status(200).send({ taskId: task.id, status: task.status, result: task.payload });
  });
}

module.exports = fileRoutes;








