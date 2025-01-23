import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@mui/material';
import EditOfferModal from './EditOfferModal';

const OffersList = () => {
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);

  // Angebote abrufen
  useEffect(() => {
    axios.get('http://localhost:8080/offers')
      .then((response) => setOffers(response.data))
      .catch((error) => console.error('Error fetching offers:', error));
  }, []);

  // Modal schließen
  const handleModalClose = () => setSelectedOffer(null);

  // Angebot aktualisieren
  const handleUpdateOffer = (updatedOffer) => {
    axios.put(`http://localhost:8080/offers/${updatedOffer.id}`, updatedOffer)
      .then((response) => {
        setOffers((prevOffers) =>
          prevOffers.map((offer) =>
            offer.id === updatedOffer.id ? response.data.updatedOffer : offer
          )
        );
        handleModalClose();
      })
      .catch((error) => console.error('Error updating offer:', error));
  };

  return (
    <Paper class="content" style={{ margin: '20px', padding: '20px' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {offers.map((offer) => (
            <TableRow key={offer.id}>
              <TableCell>{offer.id}</TableCell>
              <TableCell>{offer.name}</TableCell>
              <TableCell>${offer.price}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setSelectedOffer(offer)}
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedOffer && (
        <EditOfferModal
          offer={selectedOffer}
          onClose={handleModalClose}
          onSave={handleUpdateOffer}
        />
      )}
    </Paper>
  );
};

export default OffersList;

