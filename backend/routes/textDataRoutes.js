const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const pump = require("util").promisify(require("stream").pipeline);
const db = require("../db");

// Promise-basierte Wrapper für SQLite-Methoden
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// In-Memory Storage für lang laufende Aufgaben
// Datenmodell: { id, status (Pending, Completed), payload, tags, substring, caseInsensitive }
const tasks = {};

/**
 * Definiert die Routen für Datei-Uploads, Tag-Verwaltung und lang laufende Tag-Suchen.
 */
async function fileRoutes(fastify, options) {
  // Erstelle das Verzeichnis für hochgeladene Dateien, falls es nicht existiert
  const assetsDir = path.join(__dirname, "..", "assets");
  await fs.promises.mkdir(assetsDir, { recursive: true });

  // POST /offers/:offerId/files – Datei-Upload für ein Angebot
  fastify.post("/offers/:offerId/files", async (request, reply) => {
    const { offerId } = request.params;
    const data = await request.file();
    const originalName = data.filename;

    // Nur .txt Dateien sind erlaubt
    if (path.extname(originalName).toLowerCase() !== ".txt") {
      reply.status(400).send({ error: "Nur .txt Dateien werden unterstützt." });
      return;
    }

    try {
      const fileId = uuidv4();
      const storedFileName = `${fileId}.txt`;
      const filePath = path.join(assetsDir, storedFileName);

      // Speichere die Datei auf dem Server
      await pump(data.file, fs.createWriteStream(filePath));

      const fileUrl = `/assets/${storedFileName}`;
      const now = new Date().toISOString();

      // Füge die Dateiinformation in die Datenbank ein
      // "tag" wird als leeres JSON-Array gespeichert
      const insertSql = `
        INSERT INTO textdata (id, originalName, storedName, tag, url, offerId, uploadedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      await run(insertSql, [fileId, originalName, storedFileName, "[]", fileUrl, offerId, now]);

      const newFileEntry = await get("SELECT * FROM textdata WHERE id = ?", [fileId]);
      reply.send(newFileEntry);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Interner Serverfehler" });
    }
  });

  // GET /offers/:offerId/files – Alle Dateien eines Angebots abrufen
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

  // GET /offers/:offerId/files/:fileId/tags – Alle Tags eines Textdokuments abrufen
  fastify.get("/offers/:offerId/files/:fileId/tags", async (request, reply) => {
    const { offerId, fileId } = request.params;
    try {
      const file = await get("SELECT tag FROM textdata WHERE id = ? AND offerId = ?", [fileId, offerId]);
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

  // POST /offers/:offerId/files/:fileId/tags – Neuen Tag zu einem Textdokument hinzufügen
  fastify.post("/offers/:offerId/files/:fileId/tags", async (request, reply) => {
    const { offerId, fileId } = request.params;
    const { text } = request.body;
    if (!text || !text.trim()) {
      reply.status(400).send({ error: "Tag-Text darf nicht leer sein." });
      return;
    }
    try {
      const file = await get("SELECT tag FROM textdata WHERE id = ? AND offerId = ?", [fileId, offerId]);
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
      await run("UPDATE textdata SET tag = ? WHERE id = ? AND offerId = ?", [JSON.stringify(tags), fileId, offerId]);
      reply.send(newTag);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Interner Serverfehler" });
    }
  });

  // PUT /offers/:offerId/files/:fileId/tags/:tagId – Einen bestehenden Tag bearbeiten
  fastify.put("/offers/:offerId/files/:fileId/tags/:tagId", async (request, reply) => {
    const { offerId, fileId, tagId } = request.params;
    const { text } = request.body;
    if (!text || !text.trim()) {
      reply.status(400).send({ error: "Tag-Text darf nicht leer sein." });
      return;
    }
    try {
      const file = await get("SELECT tag FROM textdata WHERE id = ? AND offerId = ?", [fileId, offerId]);
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
      await run("UPDATE textdata SET tag = ? WHERE id = ? AND offerId = ?", [JSON.stringify(tags), fileId, offerId]);
      reply.send(updatedTag);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Interner Serverfehler" });
    }
  });

  // DELETE /offers/:offerId/files/:fileId/tags/:tagId – Einen Tag löschen
  fastify.delete("/offers/:offerId/files/:fileId/tags/:tagId", async (request, reply) => {
    const { offerId, fileId, tagId } = request.params;
    try {
      const file = await get("SELECT tag FROM textdata WHERE id = ? AND offerId = ?", [fileId, offerId]);
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
      await run("UPDATE textdata SET tag = ? WHERE id = ? AND offerId = ?", [JSON.stringify(tags), fileId, offerId]);
      reply.send({ success: true });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Interner Serverfehler" });
    }
  });

  // =====================================================================
  // Lang laufende Operation: Suche nach Dateien anhand von Tags
  // =====================================================================

  /**
   * POST /tags/search
   * Startet eine lang laufende Suche, die alle Dateien ermittelt,
   * die alle angegebenen Tags enthalten.
   * Erwartet im Body: { tags: [ "tag1", "tag2", ... ], substring: boolean, caseInsensitive: boolean }
   * Antwortet sofort mit einer Task-ID (Status 202).
   */
  fastify.post("/tags/search", async (request, reply) => {
    const { tags, substring, caseInsensitive } = request.body;
    if (!Array.isArray(tags) || tags.length === 0) {
      reply.status(400).send({ error: "Bitte geben Sie eine Liste von Tags an." });
      return;
    }
    const taskId = uuidv4();
    tasks[taskId] = { id: taskId, status: "Pending", payload: null, tags, substring, caseInsensitive };

    // Simuliere eine lang laufende Operation mit 60 Sekunden Verzögerung
    setTimeout(async () => {
      try {
        // Hole alle Dateien aus der Datenbank
        const rows = await all("SELECT id, originalName AS name, url, tag FROM textdata");
        // Filtere Dateien, die alle gesuchten Tags enthalten
        const matchingFiles = rows.filter(row => {
          let fileTags = [];
          if (row.tag) {
            try {
              fileTags = JSON.parse(row.tag);
            } catch (e) {
              fileTags = [];
            }
          }
          // Extrahiere die Tag-Texte
          const fileTagTexts = fileTags.map(t => t.text);

          // Vergleiche basierend auf den Suchoptionen:
          // - substring und caseInsensitive: Teilstring-Suche, ohne Beachtung der Groß-/Kleinschreibung
          // - nur substring: Teilstring-Suche (case-sensitive)
          // - nur caseInsensitive: exakte Übereinstimmung ohne Groß-/Kleinschreibung
          // - ansonsten: exakte Übereinstimmung
          if (substring && caseInsensitive) {
            return tags.every(searchTag =>
              fileTagTexts.some(fileTag =>
                fileTag.toLowerCase().includes(searchTag.toLowerCase())
              )
            );
          } else if (substring) {
            return tags.every(searchTag =>
              fileTagTexts.some(fileTag => fileTag.includes(searchTag))
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
    }, 60000); // 60 Sekunden Verzögerung

    // Sofortige Antwort mit Task-ID und Status 202
    reply.status(202).send({ taskId });
  });

  /**
   * GET /tags/search/:taskId
   * Mit diesem Endpunkt kann der Status der lang laufenden Suche abgefragt werden.
   * - Läuft die Suche noch, wird mit Status 202 geantwortet.
   * - Bei Abschluss wird das Ergebnis mit Status 200 zurückgegeben.
   */
  fastify.get("/tags/search/:taskId", async (request, reply) => {
    const { taskId } = request.params;
    const task = tasks[taskId];
    if (!task) {
      reply.status(404).send({ error: "Task nicht gefunden." });
      return;
    }
    if (task.status !== "Completed") {
      reply.status(202).send({ taskId: task.id, status: task.status });
      return;
    }
    reply.status(200).send({ taskId: task.id, status: task.status, result: task.payload });
  });
}

module.exports = fileRoutes;









