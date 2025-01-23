import React, { useState } from 'react';
import { Modal, Box, TextField, Button } from '@mui/material';

const EditOfferModal = ({ offer, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...offer });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Modal open={true} onClose={onClose}>
      <Box
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
        }}
      >
        <h2>Edit Offer</h2>
        <TextField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          type="number"
          fullWidth
          margin="normal"
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <Button variant="contained" color="warning" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" color="#000000" onClick={handleSave}>
            Save
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default EditOfferModal;
