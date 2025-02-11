const fs = require("fs/promises");
const path = require("path");
const authorize = require("../authorization/authorization");
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
  fastify.get(
    "/",
    { preHandler: authorize(["Account-Manager", "Developer", "User"]) },
    async (request, reply) => {
      try {
        const offers = await readOffersFile();
        return offers;
      } catch (err) {
        fastify.log.error(err);
        reply.code(500).send({ message: "Error reading offers data" });
      }
    }
  );

  // POST /offers
  fastify.post(
    "/",
    { preHandler: authorize(["Account-Manager", "Developer"]) },
    async (request, reply) => {
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
    }
  );

  // PUT /offers/:id – Angebot aktualisieren
  fastify.put(
    "/:id",
    { preHandler: authorize(["Account-Manager", "Developer"]) },
    async (request, reply) => {
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
    }
  );

  // DELETE /offers/:id – Angebot löschen
  fastify.delete(
    "/:id",
    { preHandler: authorize(["Account-Manager"]) },
    async (request, reply) => {
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
    }
  );

  // PATCH /offers/:id/status – Status-Übergang mit Validierung
  fastify.patch(
    "/:id/status",
    { preHandler: authorize(["Account-Manager", "User"]) },
    async (request, reply) => {
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
    }
  );

  // Neuer Endpoint: POST /offers/seed – Fiktive Angebote generieren
  fastify.post(
    "/seed",
    { preHandler: authorize(["Account-Manager", "Developer"]) },
    async (request, reply) => {
      try {
        const now = new Date().toISOString();
        const testOffers = [];
        // Erstelle 10 fiktive Angebote
        for (let i = 1; i <= 10; i++) {
          // Zufälliger Preis zwischen 100 und 1000 (als String)
          const price = String(Math.floor(Math.random() * 901) + 100);
          // Zufällige Statuswahl
          const randomStatus =
            VALID_STATUSES[Math.floor(Math.random() * VALID_STATUSES.length)];
          // Zufällige Kunden-Zuordnung (IDs "1" bis "5")
          const randomCustomerId = String(Math.floor(Math.random() * 5) + 1);

          testOffers.push({
            id: String(i),
            name: `Test Angebot ${i}`,
            description: `Dies ist die Beschreibung für Angebot ${i}.`,
            price: price,
            currency: "EUR",
            customerId: randomCustomerId,
            status: randomStatus,
            createdAt: now,
            updatedAt: now,
          });
        }
        await writeOffersFile(testOffers);
        reply.code(201).send(testOffers);
      } catch (err) {
        fastify.log.error(err);
        reply.code(500).send({ message: "Error seeding offers data" });
      }
    }
  );
}

module.exports = offersRoutes;
