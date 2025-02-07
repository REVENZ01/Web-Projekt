import React, { useState, useEffect } from "react";
import axios from "axios";
import EditOfferModal from "./EditOfferModal";
import CommentsModal from "./CommentsModal";
import "bootstrap/dist/css/bootstrap.min.css";

const OffersList = () => {
  const [offers, setOffers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [selectedCommentsOffer, setSelectedCommentsOffer] = useState(null);
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

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:8080/offers/${id}/status`, {
        newStatus,
      });
      setOffers((prevOffers) =>
        prevOffers.map((offer) =>
          offer.id === id ? { ...offer, status: newStatus } : offer
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Manage Offers</h2>
      <div className="mb-3 d-flex gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Name"
          value={newOffer.name}
          onChange={(e) => setNewOffer({ ...newOffer, name: e.target.value })}
        />
        <input
          type="number"
          className="form-control"
          placeholder="Price"
          value={newOffer.price}
          onChange={(e) => setNewOffer({ ...newOffer, price: e.target.value })}
        />
        <select
          className="form-select"
          value={newOffer.customerId}
          onChange={(e) =>
            setNewOffer({ ...newOffer, customerId: e.target.value })
          }
        >
          <option value="" disabled>
            Select Customer
          </option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={handleAddOffer}>
          Add Offer
        </button>
      </div>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Comments</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => (
            <tr key={offer.id}>
              <td>{offer.id}</td>
              <td>{offer.name}</td>
              <td>${offer.price}</td>
              <td>
                {customers.find((c) => c.id === offer.customerId)?.name ||
                  "None"}
              </td>
              <td>
                <select
                  className="form-select"
                  value={offer.status}
                  onChange={(e) => handleStatusChange(offer.id, e.target.value)}
                >
                  <option value="Draft">Draft</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Active">Active</option>
                  <option value="On Ice">On Ice</option>
                </select>
              </td>
              <td>
                <button
                  className="btn btn-info"
                  onClick={() => setSelectedCommentsOffer(offer)}
                >
                  View Comments
                </button>
              </td>
              <td>
                <button
                  className="btn btn-warning me-2"
                  onClick={() => setSelectedOffer(offer)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteOffer(offer.id)}
                  disabled={offer.status === "In Progress"}
                  style={{ backgroundColor: offer.status === "In Progress" ? "#d3d3d3" : "" }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedOffer && (
        <EditOfferModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onSave={handleUpdateOffer}
        />
      )}
      {selectedCommentsOffer && (
        <CommentsModal
          offer={selectedCommentsOffer}
          onClose={() => setSelectedCommentsOffer(null)}
        />
      )}
    </div>
  );
};

export default OffersList;

