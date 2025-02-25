// offers.js (Backend)
const authorize = require("../authorization/authorization");
const db = require("../db");
const VALID_STATUSES = ["Draft", "In Progress", "Active", "On Ice"];

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

async function offersRoutes(fastify, options) {
  // Globaler Hook: Löscht Angebote, deren customerId in der customers-Tabelle nicht vorhanden ist.
  fastify.addHook("onRequest", async (request, reply) => {
    try {
      await run("DELETE FROM offers WHERE customerId NOT IN (SELECT id FROM customers)");
    } catch (error) {
      fastify.log.error("Error cleaning offers with invalid customerId: " + error);
    }
  });

  // GET /offers – Mit Filterung via Query-Parameter (name, price, status)
  fastify.get(
    "/",
    { preHandler: authorize(["Account-Manager", "Developer", "User"]) },
    async (request, reply) => {
      try {
        const { name, price, status } = request.query;
        let query = "SELECT * FROM offers WHERE 1=1";
        const params = [];

        if (name) {
          query += " AND lower(name) LIKE ?";
          params.push(`%${name.toLowerCase()}%`);
        }
        if (price) {
          query += " AND CAST(price AS TEXT) LIKE ?";
          params.push(`%${price}%`);
        }
        if (status) {
          query += " AND status = ?";
          params.push(status);
        }

        const offers = await all(query, params);
        return offers;
      } catch (err) {
        fastify.log.error(err);
        reply.code(500).send({ message: "Error reading offers data" });
      }
    }
  );

  // POST /offers – Neues Angebot anlegen mit fortlaufender ID
  fastify.post(
    "/",
    { preHandler: authorize(["Account-Manager", "Developer"]) },
    async (request, reply) => {
      try {
        const { name, description, price, currency, customerId, status } = request.body;
        const now = new Date().toISOString();

        // Ermittlung der aktuell höchsten ID in der Tabelle
        const result = await get("SELECT MAX(CAST(id AS INTEGER)) as maxId FROM offers");
        const newId = result && result.maxId ? (parseInt(result.maxId, 10) + 1).toString() : "1";

        const sql = `
          INSERT INTO offers (id, name, description, price, currency, customerId, status, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await run(sql, [newId, name, description, price, currency, customerId, status, now, now]);

        const offer = await get("SELECT * FROM offers WHERE id = ?", [newId]);
        reply.code(201).send(offer);
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
        const offer = await get("SELECT * FROM offers WHERE id = ?", [id]);
        if (!offer) {
          reply.code(404).send({ message: "Offer not found" });
          return;
        }

        const updatedName = updatedOfferData.name || offer.name;
        const updatedDescription = updatedOfferData.description || offer.description;
        const updatedPrice = updatedOfferData.price || offer.price;
        const updatedCurrency = updatedOfferData.currency || offer.currency;
        const updatedCustomerId = updatedOfferData.customerId || offer.customerId;
        const updatedStatus = updatedOfferData.status || offer.status;
        const now = new Date().toISOString();

        const sql = `
          UPDATE offers
          SET name = ?, description = ?, price = ?, currency = ?, customerId = ?, status = ?, updatedAt = ?
          WHERE id = ?
        `;
        await run(sql, [
          updatedName,
          updatedDescription,
          updatedPrice,
          updatedCurrency,
          updatedCustomerId,
          updatedStatus,
          now,
          id,
        ]);

        const updatedOffer = await get("SELECT * FROM offers WHERE id = ?", [id]);
        reply.code(200).send({
          message: "Offer successfully updated",
          updatedOffer,
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
        const offer = await get("SELECT * FROM offers WHERE id = ?", [id]);
        if (!offer) {
          reply.code(404).send({ message: "Offer not found" });
          return;
        }
        await run("DELETE FROM offers WHERE id = ?", [id]);
        reply.code(200).send({
          message: "Offer successfully deleted",
          deletedOffer: offer,
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

        fastify.log.info(`Received status update request for offer ID: ${id}, New Status: ${newStatus}`);

        if (!/^\d+$/.test(id)) {
          reply.code(400).send({ message: "Invalid ID format. It must be a number." });
          return;
        }

        if (!VALID_STATUSES.includes(newStatus)) {
          reply.code(400).send({
            message: `Invalid status value. Allowed values are: ${VALID_STATUSES.join(", ")}`
          });
          return;
        }

        const offer = await get("SELECT * FROM offers WHERE id = ?", [id]);
        if (!offer) {
          reply.code(404).send({ message: "Offer not found" });
          return;
        }

        const now = new Date().toISOString();
        await run("UPDATE offers SET status = ?, updatedAt = ? WHERE id = ?", [newStatus, now, id]);

        const updatedOffer = await get("SELECT * FROM offers WHERE id = ?", [id]);
        fastify.log.info(`Offer ID ${id} successfully updated to status: ${newStatus}`);

        reply.code(200).send({
          message: "Offer status successfully updated",
          updatedOffer,
        });
      } catch (err) {
        fastify.log.error(err);
        reply.code(500).send({ message: "Error updating offer status" });
      }
    }
  );

  // POST /offers/seed – Fiktive Angebote generieren
  fastify.post(
    "/seed",
    { preHandler: authorize(["Account-Manager", "Developer"]) },
    async (request, reply) => {
      try {
        const now = new Date().toISOString();
        const testOffers = [];
        for (let i = 1; i <= 10; i++) {
          const price = Math.floor(Math.random() * 901) + 100;
          const randomStatus = VALID_STATUSES[Math.floor(Math.random() * VALID_STATUSES.length)];
          const randomCustomerId = String(Math.floor(Math.random() * 5) + 1);

          testOffers.push({
            id: i.toString(),
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

        await run("DELETE FROM offers");

        for (const offer of testOffers) {
          const sql = `
            INSERT INTO offers (id, name, description, price, currency, customerId, status, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          await run(sql, [
            offer.id,
            offer.name,
            offer.description,
            offer.price,
            offer.currency,
            offer.customerId,
            offer.status,
            offer.createdAt,
            offer.updatedAt,
          ]);
        }

        const seededOffers = await all("SELECT * FROM offers");
        reply.code(201).send(seededOffers);
      } catch (err) {
        fastify.log.error(err);
        reply.code(500).send({ message: "Error seeding offers data" });
      }
    }
  );

  // POST /offers/sample – Beispielangebote hinzufügen
  fastify.post(
    "/sample",
    { preHandler: authorize(["Account-Manager", "Developer"]) },
    async (request, reply) => {
      try {
        const sampleOffers = [
          {
            xCreatedOn: "2024-10-19T00:00:00Z",
            xCreatedBy: "John Doe",
            xSoftwareVersion: "1.0.0",
            xOffer: {
              customerId: 1,
              price: 142000,
              currency: "USD",
              state: "Active",
              name: "Offer 1",
              hints: []
            }
          },
          {
            xCreatedOn: "2024-10-20T00:00:00Z",
            xCreatedBy: "Luise Fröhlich",
            xSoftwareVersion: "1.2.0",
            xOffer: {
              customerId: 3,
              price: 56000,
              currency: "EUR",
              state: "On-Ice",
              name: "Offer 2",
              hints: ["Toller Kunde sollten wir definitiv gewinnen!"]
            }
          }
        ];

        for (const sample of sampleOffers) {
          const { xOffer } = sample;
          // Konvertierung: hints in description übernehmen, state anpassen (On-Ice => On Ice)
          const convertedOffer = {
            name: xOffer.name,
            description: xOffer.hints && xOffer.hints.length > 0 ? xOffer.hints.join(" ") : "",
            price: xOffer.price,
            currency: xOffer.currency,
            customerId: xOffer.customerId.toString(),
            status: xOffer.state === "On-Ice" ? "On Ice" : xOffer.state
          };

          // Ermittlung einer neuen fortlaufenden ID
          const result = await get("SELECT MAX(CAST(id AS INTEGER)) as maxId FROM offers");
          const newId = result && result.maxId ? (parseInt(result.maxId, 10) + 1).toString() : "1";
          const now = new Date().toISOString();

          const sql = `
            INSERT INTO offers (id, name, description, price, currency, customerId, status, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          await run(sql, [
            newId,
            convertedOffer.name,
            convertedOffer.description,
            convertedOffer.price,
            convertedOffer.currency,
            convertedOffer.customerId,
            convertedOffer.status,
            now,
            now
          ]);
        }
        const seededOffers = await all("SELECT * FROM offers");
        reply.code(201).send(seededOffers);
      } catch (err) {
        fastify.log.error(err);
        reply.code(500).send({ message: "Error adding sample offers" });
      }
    }
  );
}

module.exports = offersRoutes;







