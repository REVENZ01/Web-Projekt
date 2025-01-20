const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs/promises');
const path = require('path');

const router = express.Router();
const OFFERS_PATH = './data/offers.json';
const ASSETS_PATH = './data/assets';

// Hilfsfunktionen
async function loadOffers() {
    try {
        const data = await fs.readFile(OFFERS_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

async function saveOffers(offers) {
    await fs.writeFile(OFFERS_PATH, JSON.stringify(offers, null, 2));
}

// Dateien hochladen
router.post('/:id/files', async (req, res) => {
    const { id } = req.params;
    const fileContent = req.body.content; // Beispiel: Base64-codierter Text
    const fileName = `file-${uuidv4()}.txt`;

    try {
        const offers = await loadOffers();
        const offer = offers.find(o => o.id === id);
        if (!offer) return res.status(404).json({ error: 'Offer not found POST' });

        const filePath = path.join(ASSETS_PATH, fileName);
        await fs.writeFile(filePath, fileContent, 'utf8');

        const fileData = { id: uuidv4(), name: fileName, url: `/files/${fileName}` };
        offer.files.push(fileData);
        await saveOffers(offers);

        res.status(201).json(fileData);
    } catch (err) {
        res.status(500).json({ error: 'File upload failed POST' });
    }
});

router.get('/:id/files', async (req, res) => {
    const { id } = req.params;
    const offers = await loadOffers();
    const offer = offers.find(o => o.id === id);
    if (!offer) return res.status(404).json({ error: 'Offer not found GET' });
    res.json(offer.files || []);
});

// Kommentare hinzufügen
router.post('/:id/comments', async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;

    const offers = await loadOffers();
    const offer = offers.find(o => o.id === id);
    if (!offer) return res.status(404).json({ error: 'Offer not found' });

    const newComment = { id: uuidv4(), text, timestamp: new Date().toISOString() };
    offer.comments.push(newComment);
    await saveOffers(offers);

    res.status(201).json(newComment);
});

module.exports = router;
