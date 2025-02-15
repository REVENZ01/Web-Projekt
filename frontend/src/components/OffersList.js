// offersList.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import EditOfferModal from "./EditOfferModal";
import CommentsModal from "./CommentsModal";
import TextDataModal from "./textDataModal";
import "bootstrap/dist/css/bootstrap.min.css";
import { getAuthValue } from "./Header"; // Auth-Token basierend auf der userGroup
import "../CSS/Offers.css";

const OffersList = ({ userGroup }) => {
  // Zustände für Angebote, Kunden, Modals und neue Angebote
  const [offers, setOffers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [selectedCommentsOffer, setSelectedCommentsOffer] = useState(null);
  const [selectedFilesOffer, setSelectedFilesOffer] = useState(null);
  const [newOffer, setNewOffer] = useState({
    name: "",
    price: "",
    customerId: "",
  });

  // Filter-Zustände
  const [filterOffer, setFilterOffer] = useState({
    name: "",
    price: "",
    status: ""
  });
  const [showFilters, setShowFilters] = useState(false);

  // Auth-Token
  const authValue = getAuthValue(userGroup);

  useEffect(() => {
    fetchOffers();
    fetchCustomers();
  }, [userGroup]);

  const fetchOffers = async (filters = {}) => {
    try {
      const response = await axios.get("http://localhost:8080/offers", {
        headers: { Authorization: authValue },
        params: filters,
      });
      setOffers(response.data);
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get("http://localhost:8080/customers", {
        headers: { Authorization: authValue },
      });
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleAddOffer = async () => {
    try {
      await axios.post("http://localhost:8080/offers", newOffer, {
        headers: { Authorization: authValue },
      });
      fetchOffers();
      setNewOffer({ name: "", price: "", customerId: "" });
    } catch (error) {
      console.error("Error adding offer:", error);
    }
  };

  const handleDeleteOffer = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/offers/${id}`, {
        headers: { Authorization: authValue },
      });
      fetchOffers();
    } catch (error) {
      console.error("Error deleting offer:", error);
    }
  };

  const handleUpdateOffer = async (updatedOffer) => {
    try {
      await axios.put(
        `http://localhost:8080/offers/${updatedOffer.id}`,
        updatedOffer,
        { headers: { Authorization: authValue } }
      );
      fetchOffers();
      setSelectedOffer(null);
    } catch (error) {
      console.error("Error updating offer:", error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:8080/offers/${id}/status`,
        { newStatus },
        { headers: { Authorization: authValue } }
      );
      fetchOffers(filterOffer);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleFilterOffers = () => {
    fetchOffers(filterOffer);
  };

  const handleClearFilter = () => {
    setFilterOffer({ name: "", price: "", status: "" });
    fetchOffers({});
  };

  return (
    <div className="container mt-4 offers-container" style={{ marginTop: "2rem", marginBottom: "2rem" }}>
      <h2>Manage Offers</h2>
      {/* Hinzufügen eines neuen Angebots */}
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

      {/* Filterbereich */}
      <div className="mb-3">
        <button
          className="btn btn-outline-primary"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? "Filter ausblenden" : "Filter anzeigen"}
        </button>
      </div>

      {showFilters && (
        <div
          className="mb-3 d-flex gap-2"
          style={{
            backgroundColor: "#e3f2fd",
            padding: "10px",
            borderRadius: "5px"
          }}
        >
          <input
            type="text"
            className="form-control"
            placeholder="Filter by Name"
            value={filterOffer.name}
            onChange={(e) =>
              setFilterOffer({ ...filterOffer, name: e.target.value })
            }
          />
          <input
            type="text"
            className="form-control"
            placeholder="Filter by Price"
            value={filterOffer.price}
            onChange={(e) =>
              setFilterOffer({ ...filterOffer, price: e.target.value })
            }
          />
          <select
            className="form-select"
            value={filterOffer.status}
            onChange={(e) =>
              setFilterOffer({ ...filterOffer, status: e.target.value })
            }
          >
            <option value="">Filter by Status</option>
            <option value="Draft">Draft</option>
            <option value="In Progress">In Progress</option>
            <option value="Active">Active</option>
            <option value="On Ice">On Ice</option>
          </select>
          <button className="btn btn-secondary" onClick={handleFilterOffers}>
            Filter Offers
          </button>
          <button className="btn btn-outline-secondary" onClick={handleClearFilter}>
            Clear Filter
          </button>
        </div>
      )}

      {/* Angebote-Tabelle */}
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
              <td>{offer.price}€</td>
              <td>
                {customers.find((c) => c.id === offer.customerId)?.name || "None"}
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
                  className="btn btn-secondary me-2"
                  onClick={() => setSelectedFilesOffer(offer)}
                >
                  📄.txt
                </button>
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
                  style={{
                    backgroundColor:
                      offer.status === "In Progress" ? "#d3d3d3" : "",
                  }}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modale */}
      {selectedOffer && (
        <EditOfferModal
          userGroup={userGroup}
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onSave={handleUpdateOffer}
        />
      )}
      {selectedCommentsOffer && (
        <CommentsModal
          userGroup={userGroup}
          offer={selectedCommentsOffer}
          onClose={() => setSelectedCommentsOffer(null)}
        />
      )}
      {selectedFilesOffer && (
        <TextDataModal
          userGroup={userGroup}
          offer={selectedFilesOffer}
          onClose={() => setSelectedFilesOffer(null)}
        />
      )}
    </div>
  );
};

export default OffersList;

