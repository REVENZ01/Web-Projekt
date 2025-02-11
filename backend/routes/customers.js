const fs = require("fs/promises");
const path = require("path");
const authorize = require("../authorization/authorization");
const CUSTOMERS_FILE = path.join(__dirname, "../data/customers.json");

async function customersRoutes(fastify, options) {
  // Hilfsfunktion: Datei lesen
  async function readCustomersFile() {
    try {
      const data = await fs.readFile(CUSTOMERS_FILE, "utf-8");
      const customers = JSON.parse(data);

      // Validierung: Daten müssen ein Array sein
      if (!Array.isArray(customers)) {
        throw new Error("Invalid data format in customers.json");
      }

      return customers;
    } catch (err) {
      if (err.code === "ENOENT") {
        // Datei nicht gefunden: leeres Array zurückgeben
        return [];
      }
      throw new Error("Error reading customers file");
    }
  }

  // Hilfsfunktion: Datei schreiben
  async function writeCustomersFile(customers) {
    try {
      await fs.writeFile(CUSTOMERS_FILE, JSON.stringify(customers, null, 2));
    } catch (err) {
      throw new Error("Error writing customers file");
    }
  }

  // GET /customers
  fastify.get(
    "/",
    { preHandler: authorize(["Account-Manager", "Developer", "User"]) },
    async (request, reply) => {
      try {
        const data = await fs.readFile(CUSTOMERS_FILE, "utf-8");
        const customers = JSON.parse(data);
        return customers;
      } catch (err) {
        fastify.log.error(err);
        reply.code(500).send({ message: "Error reading customers data" });
      }
    }
  );

  // POST /customers
  fastify.post(
    "/",
    { preHandler: authorize(["Account-Manager", "Developer"]) },
    async (request, reply) => {
      try {
        let customers = [];

        try {
          const data = await fs.readFile(CUSTOMERS_FILE, "utf-8");
          customers = JSON.parse(data); // Daten aus der Datei parsen

          // Validierung der Struktur
          if (!Array.isArray(customers)) {
            throw new Error("Invalid data format in customers.json");
          }
        } catch (err) {
          if (err.code === "ENOENT") {
            // Wenn die Datei nicht existiert, wird ein leeres Array verwendet
            customers = [];
          } else {
            throw err; // Andere Fehler werfen
          }
        }

        // Neuen Kunden erstellen
        const newCustomer = {
          id: String(customers.length + 1),
          ...request.body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        customers.push(newCustomer); // Neuen Kunden hinzufügen

        // Datei aktualisieren
        await fs.writeFile(CUSTOMERS_FILE, JSON.stringify(customers, null, 2)); // Array speichern
        reply.code(201).send(newCustomer); // Erfolgsantwort mit neuem Kunden
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
        const { idOrName } = request.params; // Kann eine ID oder ein Name sein
        const customers = await readCustomersFile();

        // Gesuchten Kunden finden (per ID oder Name)
        const customerIndex = customers.findIndex(
          (customer) =>
            customer.id === idOrName ||
            customer.name.toLowerCase() === idOrName.toLowerCase()
        );

        if (customerIndex === -1) {
          reply.code(404).send({ message: "Customer not found" });
          return;
        }

        // Daten aus dem Request übernehmen
        const { name, email, age, address } = request.body;

        // Kunden aktualisieren
        customers[customerIndex] = {
          ...customers[customerIndex],
          name: name || customers[customerIndex].name,
          email: email || customers[customerIndex].email,
          age: age || customers[customerIndex].age,
          address: address || customers[customerIndex].address,
          updatedAt: new Date().toISOString(),
        };

        // Datei aktualisieren
        await writeCustomersFile(customers);

        reply.code(200).send(customers[customerIndex]); // Erfolgsantwort
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
        const customers = await readCustomersFile();

        // Gesuchten Kunden finden
        const customerIndex = customers.findIndex(
          (customer) => customer.id === id
        );
        if (customerIndex === -1) {
          reply.code(404).send({ message: "Customer not found" });
          return;
        }

        // Kunden entfernen
        const deletedCustomer = customers.splice(customerIndex, 1);

        // Datei aktualisieren
        await writeCustomersFile(customers);

        reply.code(200).send(deletedCustomer[0]); // Erfolgsantwort
      } catch (err) {
        fastify.log.error(err);
        reply.code(500).send({ message: "Error deleting customer" });
      }
    }
  );

  // Neuer Endpoint: POST /customers/seed – Fiktive Kunden generieren
  fastify.post(
    "/seed",
    { preHandler: authorize(["Account-Manager", "Developer"]) },
    async (request, reply) => {
      try {
        // Fiktive Kunden-Daten mit allen Feldern
        const testCustomers = [
          {
            name: "Test Kunde 1",
            email: "test1@example.com",
            age: 25,
            address: "Teststraße 1, Musterstadt",
          },
          {
            name: "Test Kunde 2",
            email: "test2@example.com",
            age: 30,
            address: "Teststraße 2, Musterstadt",
          },
          {
            name: "Test Kunde 3",
            email: "test3@example.com",
            age: 35,
            address: "Teststraße 3, Musterstadt",
          },
          {
            name: "Test Kunde 4",
            email: "test4@example.com",
            age: 40,
            address: "Teststraße 4, Musterstadt",
          },
          {
            name: "Test Kunde 5",
            email: "test5@example.com",
            age: 45,
            address: "Teststraße 5, Musterstadt",
          },
        ];

        const now = new Date().toISOString();
        // Neue Kundenobjekte erstellen (IDs fortlaufend)
        const newCustomers = testCustomers.map((customer, index) => ({
          id: String(index + 1),
          name: customer.name,
          email: customer.email,
          age: customer.age,
          address: customer.address,
          createdAt: now,
          updatedAt: now,
        }));

        // Überschreibe die Kunden-Datei mit den Testdaten
        await writeCustomersFile(newCustomers);
        reply.code(201).send(newCustomers);
      } catch (err) {
        fastify.log.error(err);
        reply.code(500).send({ message: "Error seeding customers data" });
      }
    }
  );
}

module.exports = customersRoutes;
