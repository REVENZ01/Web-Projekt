const fs = require('fs/promises');
const path = require('path');

const OFFERS_FILE = path.join(__dirname, '../data/offers.json');

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
  fastify.get('/', async (request, reply) => {
    try {
      const offers = await readOffersFile();
      return offers;
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ message: 'Error reading offers data' });
    }
  });

  // POST /offers
  fastify.post('/', async (request, reply) => {
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
      reply.code(500).send({ message: 'Error adding new offer' });
    }
  });

// PUT /offers/:idOrName
fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const updatedOfferData = request.body;
      const offers = await readOffersFile();
  
      // Angebot mit der angegebenen ID finden
      const offerIndex = offers.findIndex((offer) => offer.id === id);
      if (offerIndex === -1) {
        reply.code(404).send({ message: 'Offer not found' });
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
        message: 'Offer successfully updated',
        updatedOffer: offers[offerIndex],
      });
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ message: 'Error updating offer' });
    }
  });
  
// DELETE /offers/:id
fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const offers = await readOffersFile();
  
      // Angebot mit der angegebenen ID finden
      const offerIndex = offers.findIndex((offer) => offer.id === id);
      if (offerIndex === -1) {
        reply.code(404).send({ message: 'Offer not found' });
        return;
      }
  
      // Angebot entfernen
      const deletedOffer = offers.splice(offerIndex, 1);
  
      // Datei aktualisieren
      await writeOffersFile(offers);
  
      reply.code(200).send({
        message: 'Offer successfully deleted',
        deletedOffer: deletedOffer[0],
      });
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ message: 'Error deleting offer' });
    }
  });  
}

module.exports = offersRoutes;
