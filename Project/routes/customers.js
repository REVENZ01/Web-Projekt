const fs = require('fs/promises');
const path = require('path');

const CUSTOMERS_FILE = path.join(__dirname, '../data/customers.json');

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
  fastify.get('/', async (request, reply) => {
    try {
      const data = await fs.readFile(CUSTOMERS_FILE, 'utf-8');
      const customers = JSON.parse(data);
      return customers;
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ message: 'Error reading customers data' });
    }
  });

// POST /customers
// POST /customers
fastify.post('/', async (request, reply) => {
  try {
    let customers = [];

    try {
      const data = await fs.readFile(CUSTOMERS_FILE, 'utf-8');
      customers = JSON.parse(data); // Daten aus der Datei parsen

      // Validierung der Struktur
      if (!Array.isArray(customers)) {
        throw new Error('Invalid data format in customers.json');
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
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
    reply.code(500).send({ message: 'Error saving customer data' });
  }
});

// PUT /customers/:idOrName
fastify.put("/:idOrName", async (request, reply) => {
  try {
    const { idOrName } = request.params; // Kann eine ID oder ein Name sein
    const customers = await readCustomersFile();

    // Gesuchten Kunden finden (per ID oder Name)
    const customerIndex = customers.findIndex(
      (customer) =>
        customer.id === idOrName || customer.name.toLowerCase() === idOrName.toLowerCase()
    );

    if (customerIndex === -1) {
      reply.code(404).send({ message: "Customer not found" });
      return;
    }

    // Daten aus dem Request übernehmen
    const { name, contact, address } = request.body;

    // Kunden aktualisieren
    customers[customerIndex] = {
      ...customers[customerIndex],
      name: name || customers[customerIndex].name,
      contact: contact || customers[customerIndex].contact,
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
});


// DELETE /customers/:id
fastify.delete("/:id", async (request, reply) => {
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
});


}

module.exports = customersRoutes;

