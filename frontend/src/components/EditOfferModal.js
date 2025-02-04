import React, { useState } from "react";
import { Modal, Box, TextField } from "@mui/material";
import "bootstrap/dist/css/bootstrap.min.css";
import "../CSS/Offers.css";

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
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          backgroundColor: "#E0FFFF",
          padding: "20px",
          borderRadius: "8px",
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
        <div className="d-flex justify-content-between mt-3">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-dark" onClick={handleSave}>
            Save
          </button>
        </div>
      </Box>
    </Modal>
  );
};

export default EditOfferModal;
