const fs = require('fs/promises');
const path = require('path');

const CUSTOMERS_FILE = path.join(__dirname, '../data/customers.json');

async function customersRoutes(fastify, options) {
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
  fastify.post('/', async (request, reply) => {
    try {
      const data = await fs.readFile(CUSTOMERS_FILE, 'utf-8');
      const customers = JSON.parse(data);

      const newCustomer = {
        id: String(customers.length + 1),
        ...request.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      customers.push(newCustomer);
      await fs.writeFile(CUSTOMERS_FILE, JSON.stringify(customers, null, 2));
      reply.code(201).send(newCustomer);
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ message: 'Error adding new customer' });
    }
  });
}

module.exports = customersRoutes;

