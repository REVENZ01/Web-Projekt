const authorize = require("../authorization/authorization");
const db = require("../db");

// Hilfsfunktionen, um die Callback-basierten SQLite-Methoden in Promises zu kapseln
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

async function customersRoutes(fastify, options) {
  // GET /customers – Mit Filterung via Query-Parameter (name, contact, address)
  fastify.get(
    "/",
    { preHandler: authorize(["Account-Manager", "Developer", "User"]) },
    async (request, reply) => {
      try {
        const { name, contact, address } = request.query;
        let query = "SELECT * FROM customers WHERE 1=1";
        const params = [];

        if (name) {
          query += " AND lower(name) LIKE ?";
          params.push(`%${name.toLowerCase()}%`);
        }
        if (contact) {
          query += " AND lower(contact) LIKE ?";
          params.push(`%${contact.toLowerCase()}%`);
        }
        if (address) {
          query += " AND lower(address) LIKE ?";
          params.push(`%${address.toLowerCase()}%`);
        }

        const customers = await all(query, params);
        return customers;
      } catch (err) {
        fastify.log.error(err);
        reply.code(500).send({ message: "Error reading customers data" });
      }
    }
  );

  // POST /customers – Neuer Kunde wird angelegt mit fortlaufender ID
  fastify.post(
    "/",
    { preHandler: authorize(["Account-Manager", "Developer"]) },
    async (request, reply) => {
      try {
        const { name, email, age, address, contact } = request.body;
        const now = new Date().toISOString();

        // Hole die aktuell höchste ID (als Zahl) aus der Datenbank
        const result = await get("SELECT MAX(CAST(id AS INTEGER)) as maxId FROM customers");
        // Wenn kein Kunde existiert, starte mit 1, sonst erhöhe die höchste ID um 1
        const newId = result && result.maxId ? (parseInt(result.maxId, 10) + 1).toString() : "1";

        const sql =
          "INSERT INTO customers (id, name, email, age, address, contact, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        await run(sql, [newId, name, email, age, address, contact, now, now]);

        // Neuen Kunden auslesen und zurückgeben
        const customer = await get("SELECT * FROM customers WHERE id = ?", [newId]);
        reply.code(201).send(customer);
      } catch (err) {
        fastify.log.error(err);
        reply.code(500).send({ message: "Error saving customer data" });
      }
    }
  );

  // PUT /customers/:idOrName
  fastify.put(
    "/:idOrName",
    { preHandler: authorize(["Account-Manager", "Developer"]) },
    async (request, reply) => {
      try {
        const { idOrName } = request.params;
        // Suche den Kunden per ID oder (case-insensitive) Name
        const customer = await get(
          "SELECT * FROM customers WHERE id = ? OR lower(name) = ?",
          [idOrName, idOrName.toLowerCase()]
        );
        if (!customer) {
          reply.code(404).send({ message: "Customer not found" });
          return;
        }

        const { name, email, age, address, contact } = request.body;
        const updatedName = name || customer.name;
        const updatedEmail = email || customer.email;
        const updatedAge = age || customer.age;
        const updatedAddress = address || customer.address;
        const updatedContact = contact || customer.contact;
        const now = new Date().toISOString();

        const sql =
          "UPDATE customers SET name = ?, email = ?, age = ?, address = ?, contact = ?, updatedAt = ? WHERE id = ?";
        await run(sql, [
          updatedName,
          updatedEmail,
          updatedAge,
          updatedAddress,
          updatedContact,
          now,
          customer.id,
        ]);

        const updatedCustomer = await get(
          "SELECT * FROM customers WHERE id = ?",
          [customer.id]
        );
        reply.code(200).send(updatedCustomer);
      } catch (err) {
        fastify.log.error(err);
        reply.code(500).send({ message: "Error updating customer" });
      }
    }
  );

  // DELETE /customers/:id
  fastify.delete(
    "/:id",
    { preHandler: authorize(["Account-Manager"]) },
    async (request, reply) => {
      try {
        const { id } = request.params;
        // Kunden vor der Löschung auslesen, um ihn zurückzugeben
        const customer = await get("SELECT * FROM customers WHERE id = ?", [id]);
        if (!customer) {
          reply.code(404).send({ message: "Customer not found" });
          return;
        }
        await run("DELETE FROM customers WHERE id = ?", [id]);
        reply.code(200).send(customer);
      } catch (err) {
        fastify.log.error(err);
        reply.code(500).send({ message: "Error deleting customer" });
      }
    }
  );

  // POST /customers/seed – Fiktive Kunden generieren
  fastify.post(
    "/seed",
    { preHandler: authorize(["Account-Manager", "Developer"]) },
    async (request, reply) => {
      try {
        const testCustomers = [
          {
            name: "Test Kunde 1",
            email: "test1@example.com",
            age: 25,
            address: "Teststraße 1, Musterstadt",
            contact: "123456789",
          },
          {
            name: "Test Kunde 2",
            email: "test2@example.com",
            age: 30,
            address: "Teststraße 2, Musterstadt",
            contact: "987654321",
          },
          {
            name: "Test Kunde 3",
            email: "test3@example.com",
            age: 35,
            address: "Teststraße 3, Musterstadt",
            contact: "555555555",
          },
          {
            name: "Test Kunde 4",
            email: "test4@example.com",
            age: 40,
            address: "Teststraße 4, Musterstadt",
            contact: "444444444",
          },
          {
            name: "Test Kunde 5",
            email: "test5@example.com",
            age: 45,
            address: "Teststraße 5, Musterstadt",
            contact: "333333333",
          },
        ];
        const now = new Date().toISOString();

        // Bestehende Kunden löschen
        await run("DELETE FROM customers");

        // Seed-Daten einfügen
        for (let i = 0; i < testCustomers.length; i++) {
          const customer = testCustomers[i];
          // Verwende hier eine einfache ID (i+1 als String)
          const id = (i + 1).toString();
          const sql =
            "INSERT INTO customers (id, name, email, age, address, contact, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
          await run(sql, [
            id,
            customer.name,
            customer.email,
            customer.age,
            customer.address,
            customer.contact,
            now,
            now,
          ]);
        }
        // Alle eingefügten Kunden abrufen und zurückgeben
        const seededCustomers = await all("SELECT * FROM customers");
        reply.code(201).send(seededCustomers);
      } catch (err) {
        fastify.log.error(err);
        reply.code(500).send({ message: "Error seeding customers data" });
      }
    }
  );
}

module.exports = customersRoutes;


