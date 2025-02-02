import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  Select,
} from "@mui/material";
import EditOfferModal from "./EditOfferModal";

const OffersList = () => {
  const [offers, setOffers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [newOffer, setNewOffer] = useState({
    name: "",
    price: "",
    customerId: "",
  });

  useEffect(() => {
    fetchOffers();
    fetchCustomers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await axios.get("http://localhost:8080/offers");
      setOffers(response.data);
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get("http://localhost:8080/customers");
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleAddOffer = async () => {
    try {
      await axios.post("http://localhost:8080/offers", newOffer);
      fetchOffers();
      setNewOffer({ name: "", price: "", customerId: "" });
    } catch (error) {
      console.error("Error adding offer:", error);
    }
  };

  const handleDeleteOffer = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/offers/${id}`);
      fetchOffers();
    } catch (error) {
      console.error("Error deleting offer:", error);
    }
  };

  const handleUpdateOffer = async (updatedOffer) => {
    try {
      await axios.put(
        `http://localhost:8080/offers/${updatedOffer.id}`,
        updatedOffer
      );
      fetchOffers();
      setSelectedOffer(null);
    } catch (error) {
      console.error("Error updating offer:", error);
    }
  };

  return (
    <Paper className="content" style={{ margin: "20px", padding: "20px" }}>
      <h2>Manage Offers</h2>

      <div>
        <TextField
          label="Name"
          value={newOffer.name}
          onChange={(e) => setNewOffer({ ...newOffer, name: e.target.value })}
        />
        <TextField
          label="Price"
          type="number"
          value={newOffer.price}
          onChange={(e) => setNewOffer({ ...newOffer, price: e.target.value })}
        />
        <Select
          value={newOffer.customerId}
          onChange={(e) =>
            setNewOffer({ ...newOffer, customerId: e.target.value })
          }
          displayEmpty
        >
          <MenuItem value="" disabled>
            Select Customer
          </MenuItem>
          {customers.map((customer) => (
            <MenuItem key={customer.id} value={customer.id}>
              {customer.name}
            </MenuItem>
          ))}
        </Select>
        <Button variant="contained" color="primary" onClick={handleAddOffer}>
          Add Offer
        </Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Customer</TableCell>
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
                {customers.find((c) => c.id === offer.customerId)?.name ||
                  "None"}
              </TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setSelectedOffer(offer)}
                >
                  Edit
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleDeleteOffer(offer.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedOffer && (
        <EditOfferModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onSave={handleUpdateOffer}
        />
      )}
    </Paper>
  );
};

export default OffersList;