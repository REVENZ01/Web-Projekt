const fs = require("fs/promises");
const path = require("path");
const authorize = require("../Authorization/Authorization");
const COMMENTS_FILE = path.join(__dirname, "../data/comments.json");

async function commentsRoutes(fastify, options) {
  // Hilfsfunktion: Kommentare-Datei lesen
  async function readCommentsFile() {
    try {
      const data = await fs.readFile(COMMENTS_FILE, "utf-8");
      const comments = JSON.parse(data);
      if (!Array.isArray(comments)) {
        throw new Error("Invalid data format in comments.json");
      }
      return comments;
    } catch (err) {
      if (err.code === "ENOENT") {
        return []; // Datei existiert nicht, Rückgabe eines leeren Arrays
      }
      throw new Error("Error reading comments file");
    }
  }

  // Hilfsfunktion: Kommentare-Datei schreiben
  async function writeCommentsFile(comments) {
    try {
      await fs.writeFile(COMMENTS_FILE, JSON.stringify(comments, null, 2));
    } catch (err) {
      throw new Error("Error writing comments file");
    }
  }

  // **GET /offers/:offerId/comments** → Alle Kommentare für ein Angebot abrufen
  fastify.get("/offers/:offerId/comments",
    { preHandler: authorize(["Account-Manager", "Developer", "User"]) },
     async (request, reply) => {
    try {
      const { offerId } = request.params;
      const comments = await readCommentsFile();
      const offerComments = comments.filter(
        (comment) => comment.offerId === offerId
      );
      reply.send(offerComments);
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ message: "Error retrieving comments" });
    }
  });

  // **POST /offers/:offerId/comments** → Neuen Kommentar hinzufügen
  fastify.post("/offers/:offerId/comments",
    { preHandler: authorize(["Account-Manager", "Developer", "User"]) },
    async (request, reply) => {
    try {
      const { offerId } = request.params;
      const { text } = request.body;

      if (!text) {
        return reply.code(400).send({ message: "Comment text is required" });
      }

      const comments = await readCommentsFile();
      const newId =
        comments.length > 0
          ? String(Number(comments[comments.length - 1].id) + 1)
          : "1"; // ID hochzählen

      const newComment = {
        id: newId,
        offerId,
        text,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      comments.push(newComment);
      await writeCommentsFile(comments);

      reply.code(201).send(newComment);
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ message: "Error adding comment" });
    }
  });

  // **PUT /offers/:offerId/comments/:commentId** → Kommentar aktualisieren
  fastify.put(
    "/offers/:offerId/comments/:commentId",
    { preHandler: authorize(["Account-Manager", "Developer"]) },
    async (request, reply) => {
      try {
        const { offerId, commentId } = request.params;
        const { text } = request.body;

        if (!text) {
          return reply.code(400).send({ message: "Comment text is required" });
        }

        const comments = await readCommentsFile();
        const commentIndex = comments.findIndex(
          (comment) => comment.id === commentId && comment.offerId === offerId
        );

        if (commentIndex === -1) {
          return reply.code(404).send({ message: "Comment not found" });
        }

        comments[commentIndex] = {
          ...comments[commentIndex],
          text,
          updatedAt: new Date().toISOString(),
        };

        await writeCommentsFile(comments);

        reply.code(200).send({
          message: "Comment successfully updated",
          updatedComment: comments[commentIndex],
        });
      } catch (err) {
        fastify.log.error(err);
        reply.code(500).send({ message: "Error updating comment" });
      }
    }
  );

  // **DELETE /offers/:offerId/comments/:commentId** → Kommentar löschen
  fastify.delete(
    "/offers/:offerId/comments/:commentId",
    { preHandler: authorize(["Account-Manager", "Developer"]) },
    async (request, reply) => {
      try {
        const { offerId, commentId } = request.params;
        const comments = await readCommentsFile();

        const commentIndex = comments.findIndex(
          (comment) => comment.id === commentId && comment.offerId === offerId
        );
        if (commentIndex === -1) {
          return reply.code(404).send({ message: "Comment not found" });
        }

        const deletedComment = comments.splice(commentIndex, 1);
        await writeCommentsFile(comments);

        reply.code(200).send({
          message: "Comment successfully deleted",
          deletedComment: deletedComment[0],
        });
      } catch (err) {
        fastify.log.error(err);
        reply.code(500).send({ message: "Error deleting comment" });
      }
    }
  );

// **Automatisches Löschen von Kommentaren ohne zugewiesene Offer-ID**
async function removeUnassignedComments() {
  try {
    let comments = await readCommentsFile();
    const filteredComments = comments.filter(comment => comment.offerId);

    if (filteredComments.length !== comments.length) {
      await writeCommentsFile(filteredComments);
      fastify.log.info("Comments without assigned offer IDs were deleted.");
    }
  } catch (err) {
    fastify.log.error("Error cleaning up comments:", err);
  }
}

// Rufe die Bereinigung regelmäßig auf
setInterval(removeUnassignedComments, 60000); // Alle 60 Sekunden

}

module.exports = commentsRoutes;
