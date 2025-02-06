const fs = require("fs/promises");
const path = require("path");

const OFFERS_FILE = path.join(__dirname, "../data/offers.json");

// Erlaubte Statuswerte
const VALID_STATUSES = ["Draft", "In Progress", "Active", "On Ice"];

async function offersRoutes(fastify, options) {
  // Hilfsfunktion: Datei lesen
  async function readOffersFile() {
    try {
      const data = await fs.readFile(OFFERS_FILE, "utf-8");
      const offers = JSON.parse(data);

      // Validierung: Daten müssen ein Array sein
      if (!Array.isArray(offers)) {
        throw new Error("Invalid data format in offers.json");
      }

      return offers;
    } catch (err) {
      if (err.code === "ENOENT") {
        // Datei nicht gefunden: leeres Array zurückgeben
        return [];
      }
      throw new Error("Error reading offers file");
    }
  }

  // Hilfsfunktion: Datei schreiben
  async function writeOffersFile(offers) {
    try {
      await fs.writeFile(OFFERS_FILE, JSON.stringify(offers, null, 2));
    } catch (err) {
      throw new Error("Error writing offers file");
    }
  }

  // GET /offers
  fastify.get("/", async (request, reply) => {
    try {
      const offers = await readOffersFile();
      return offers;
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ message: "Error reading offers data" });
    }
  });

  // POST /offers
  fastify.post("/", async (request, reply) => {
    try {
      const offers = await readOffersFile();

      const newOffer = {
        id: String(offers.length + 1),
        ...request.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      offers.push(newOffer);
      await writeOffersFile(offers);

      reply.code(201).send(newOffer);
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ message: "Error adding new offer" });
    }
  });

  // PUT /offers/:id – Angebot aktualisieren
  fastify.put("/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const updatedOfferData = request.body;
      const offers = await readOffersFile();

      // Angebot mit der angegebenen ID finden
      const offerIndex = offers.findIndex((offer) => offer.id === id);
      if (offerIndex === -1) {
        reply.code(404).send({ message: "Offer not found" });
        return;
      }

      // Angebot aktualisieren
      offers[offerIndex] = {
        ...offers[offerIndex],
        ...updatedOfferData,
        updatedAt: new Date().toISOString(), // Aktualisierungszeit hinzufügen
      };

      // Datei aktualisieren
      await writeOffersFile(offers);

      reply.code(200).send({
        message: "Offer successfully updated",
        updatedOffer: offers[offerIndex],
      });
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ message: "Error updating offer" });
    }
  });

  // DELETE /offers/:id – Angebot löschen
  fastify.delete("/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const offers = await readOffersFile();

      // Angebot mit der angegebenen ID finden
      const offerIndex = offers.findIndex((offer) => offer.id === id);
      if (offerIndex === -1) {
        reply.code(404).send({ message: "Offer not found" });
        return;
      }

      // Angebot entfernen
      const deletedOffer = offers.splice(offerIndex, 1);

      // Datei aktualisieren
      await writeOffersFile(offers);

      reply.code(200).send({
        message: "Offer successfully deleted",
        deletedOffer: deletedOffer[0],
      });
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ message: "Error deleting offer" });
    }
  });

  // PATCH /offers/:id/status – Status-Übergang mit Validierung
  fastify.patch("/:id/status", async (request, reply) => {
    try {
      const { id } = request.params;
      const { newStatus } = request.body;

      fastify.log.info(
        `Received status update request for offer ID: ${id}, New Status: ${newStatus}`
      );

      // ID-Format überprüfen (nur Zahlen zulässig)
      if (!/^\d+$/.test(id)) {
        reply
          .code(400)
          .send({ message: "Invalid ID format. It must be a number." });
        return;
      }

      // Validierung des Status
      if (!VALID_STATUSES.includes(newStatus)) {
        reply.code(400).send({
          message: `Invalid status value. Allowed values are: ${VALID_STATUSES.join(
            ", "
          )}`,
        });
        return;
      }

      const offers = await readOffersFile();
      const offerIndex = offers.findIndex((offer) => offer.id === id);

      if (offerIndex === -1) {
        reply.code(404).send({ message: "Offer not found" });
        return;
      }

      // Status aktualisieren
      offers[offerIndex].status = newStatus;
      offers[offerIndex].updatedAt = new Date().toISOString();

      // Datei aktualisieren
      await writeOffersFile(offers);

      fastify.log.info(
        `Offer ID ${id} successfully updated to status: ${newStatus}`
      );

      reply.code(200).send({
        message: "Offer status successfully updated",
        updatedOffer: offers[offerIndex],
      });
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ message: "Error updating offer status" });
    }
  });
}

module.exports = offersRoutes;
