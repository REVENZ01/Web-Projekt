import React, { useState } from "react";
import { Modal, Box, TextField, Button } from "@mui/material";

const EditCustomerModal = ({ customer, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...customer });

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
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <h2>Edit Customer</h2>
        <TextField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Contact"
          name="contact"
          value={formData.contact}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "20px",
          }}
        >
          <Button variant="contained" color="warning" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default EditCustomerModal;

