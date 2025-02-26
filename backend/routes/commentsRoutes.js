const authorize = require("../Authorization/Authorization");
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

async function commentsRoutes(fastify, options) {
  // GET /offers/:offerId/comments – Alle Kommentare für ein Angebot abrufen
  fastify.get(
    "/offers/:offerId/comments",
    { preHandler: authorize(["Account-Manager", "Developer", "User"]) },
    async (request, reply) => {
      try {
        const { offerId } = request.params;
        const comments = await all(
          "SELECT * FROM comments WHERE offerId = ?",
          [offerId]
        );
        reply.send(comments);
      } catch (err) {
        fastify.log.error(err);
        reply.code(500).send({ message: "Error retrieving comments" });
      }
    }
  );

  // POST /offers/:offerId/comments – Neuen Kommentar hinzufügen
  fastify.post(
    "/offers/:offerId/comments",
    { preHandler: authorize(["Account-Manager", "Developer", "User"]) },
    async (request, reply) => {
      try {
        const { offerId } = request.params;
        const { text } = request.body;
        if (!text) {
          return reply
            .code(400)
            .send({ message: "Comment text is required" });
        }
        const now = new Date().toISOString();

        // Ermittle die aktuell höchste ID in der comments-Tabelle
        const result = await get("SELECT MAX(CAST(id AS INTEGER)) as maxId FROM comments");
        // Wenn keine Kommentare existieren, starte bei "1"
        const newId = result && result.maxId ? (parseInt(result.maxId, 10) + 1).toString() : "1";

        const sql = `
          INSERT INTO comments (id, offerId, text, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?)
        `;
        await run(sql, [newId, offerId, text, now, now]);
        const newComment = await get("SELECT * FROM comments WHERE id = ?", [newId]);
        reply.code(201).send(newComment);
      } catch (err) {
        fastify.log.error(err);
        reply.code(500).send({ message: "Error adding comment" });
      }
    }
  );

  // PUT /offers/:offerId/comments/:commentId – Kommentar aktualisieren
  fastify.put(
    "/offers/:offerId/comments/:commentId",
    { preHandler: authorize(["Account-Manager", "Developer"]) },
    async (request, reply) => {
      try {
        const { offerId, commentId } = request.params;
        const { text } = request.body;
        if (!text) {
          return reply
            .code(400)
            .send({ message: "Comment text is required" });
        }
        // Existierenden Kommentar abrufen
        const comment = await get(
          "SELECT * FROM comments WHERE id = ? AND offerId = ?",
          [commentId, offerId]
        );
        if (!comment) {
          return reply.code(404).send({ message: "Comment not found" });
        }
        const now = new Date().toISOString();
        const sql = `
          UPDATE comments
          SET text = ?, updatedAt = ?
          WHERE id = ? AND offerId = ?
        `;
        await run(sql, [text, now, commentId, offerId]);
        const updatedComment = await get(
          "SELECT * FROM comments WHERE id = ? AND offerId = ?",
          [commentId, offerId]
        );
        reply.code(200).send({
          message: "Comment successfully updated",
          updatedComment,
        });
      } catch (err) {
        fastify.log.error(err);
        reply.code(500).send({ message: "Error updating comment" });
      }
    }
  );

  // DELETE /offers/:offerId/comments/:commentId – Kommentar löschen
  fastify.delete(
    "/offers/:offerId/comments/:commentId",
    { preHandler: authorize(["Account-Manager", "Developer"]) },
    async (request, reply) => {
      try {
        const { offerId, commentId } = request.params;
        // Kommentar abrufen, um ihn später zurückzugeben
        const comment = await get(
          "SELECT * FROM comments WHERE id = ? AND offerId = ?",
          [commentId, offerId]
        );
        if (!comment) {
          return reply.code(404).send({ message: "Comment not found" });
        }
        await run("DELETE FROM comments WHERE id = ? AND offerId = ?", [
          commentId,
          offerId,
        ]);
        reply.code(200).send({
          message: "Comment successfully deleted",
          deletedComment: comment,
        });
      } catch (err) {
        fastify.log.error(err);
        reply.code(500).send({ message: "Error deleting comment" });
      }
    }
  );

  // Automatisches Löschen von Kommentaren ohne zugewiesene Offer-ID
  async function removeUnassignedComments() {
    try {
      // Lösche alle Kommentare, bei denen offerId NULL oder leer ist
      await run(
        "DELETE FROM comments WHERE offerId IS NULL OR TRIM(offerId) = ''"
      );
      fastify.log.info("Comments without assigned offer IDs were deleted.");
    } catch (err) {
      fastify.log.error("Error cleaning up comments:", err);
    }
  }

  // Rufe die Bereinigung regelmäßig alle 60 Sekunden auf
  setInterval(removeUnassignedComments, 60000);
}

module.exports = commentsRoutes;


