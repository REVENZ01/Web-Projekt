// OffersList.js
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
  const [selectedDescriptionOffer, setSelectedDescriptionOffer] = useState(null);
  const [selectedDetailOffer, setSelectedDetailOffer] = useState(null);

  const [newOffer, setNewOffer] = useState({
    name: "",
    price: "",
    customerId: "",
    currency: "EUR", // Dropdown zur Währungsauswahl
    description: "", // Beschreibungstext, der im neuen Modal angezeigt wird
    status: "Draft"  // Standardstatus
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
      setNewOffer({
        name: "",
        price: "",
        customerId: "",
        currency: "EUR",
        description: "",
        status: "Draft"
      });
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

  // Neue Funktion: Beispielangebote hinzufügen über den neuen Endpoint /offers/sample
  const handleAddSampleOffers = async () => {
    try {
      await axios.post("http://localhost:8080/offers/sample", {}, {
        headers: { Authorization: authValue },
      });
      fetchOffers();
    } catch (error) {
      console.error("Error adding sample offers:", error);
    }
  };

  // Funktionen für die Detailansicht, die die jeweiligen Modals öffnen
  const handleDetailViewComments = () => {
    setSelectedCommentsOffer(selectedDetailOffer);
    setSelectedDetailOffer(null);
  };

  const handleDetailViewDescription = () => {
    setSelectedDescriptionOffer(selectedDetailOffer);
    setSelectedDetailOffer(null);
  };

  const handleDetailViewTxt = () => {
    setSelectedFilesOffer(selectedDetailOffer);
    setSelectedDetailOffer(null);
  };

  return (
    <div className="container mt-4 offers-container" style={{ marginTop: "2rem", marginBottom: "2rem" }}>
      <h2>Manage Offers</h2>
      {/* Hinzufügen eines neuen Angebots */}
      <div className="mb-3 d-flex gap-2 align-items-end">
        <div className="flex-grow-1">
          <label>Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Name"
            value={newOffer.name}
            onChange={(e) => setNewOffer({ ...newOffer, name: e.target.value })}
          />
        </div>
        <div>
          <label>Price</label>
          <input
            type="number"
            className="form-control"
            placeholder="Price"
            value={newOffer.price}
            onChange={(e) => setNewOffer({ ...newOffer, price: e.target.value })}
          />
        </div>
        <div>
          <label>Currency</label>
          <select
            className="form-select"
            value={newOffer.currency}
            onChange={(e) => setNewOffer({ ...newOffer, currency: e.target.value })}
          >
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        <div>
          <label>Customer</label>
          <select
            className="form-select"
            value={newOffer.customerId}
            onChange={(e) => setNewOffer({ ...newOffer, customerId: e.target.value })}
          >
            <option value="" disabled>Select Customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>
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
        <div className="mb-3 d-flex gap-2" style={{ backgroundColor: "#e3f2fd", padding: "10px", borderRadius: "5px" }}>
          <input
            type="text"
            className="form-control"
            placeholder="Filter by Name"
            value={filterOffer.name}
            onChange={(e) => setFilterOffer({ ...filterOffer, name: e.target.value })}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Filter by Price"
            value={filterOffer.price}
            onChange={(e) => setFilterOffer({ ...filterOffer, price: e.target.value })}
          />
          <select
            className="form-select"
            value={filterOffer.status}
            onChange={(e) => setFilterOffer({ ...filterOffer, status: e.target.value })}
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

      {/* Button zum Hinzufügen von Beispielangeboten */}
      <div className="mb-3">
        <button className="btn btn-success" onClick={handleAddSampleOffers}>
          Add legacy data
        </button>
      </div>

      {/* Angebote-Tabelle */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Currency</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => (
            <tr key={offer.id}>
              <td>{offer.id}</td>
              <td>{offer.name}</td>
              <td>{offer.price}</td>
              <td>{offer.currency}</td>
              <td>{customers.find((c) => c.id === offer.customerId)?.name || "None"}</td>
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
                  className="btn btn-info me-2"
                  onClick={() => setSelectedDetailOffer(offer)}
                >
                  Detailansicht
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
                  style={{ backgroundColor: offer.status === "In Progress" ? "#d3d3d3" : "" }}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Externe Modale */}
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
      {selectedDescriptionOffer && (
        <DescriptionModal
          offer={selectedDescriptionOffer}
          onClose={() => setSelectedDescriptionOffer(null)}
        />
      )}
      {selectedDetailOffer && (
        <DetailViewModal
          offer={selectedDetailOffer}
          onClose={() => setSelectedDetailOffer(null)}
          onViewComments={handleDetailViewComments}
          onViewDescription={handleDetailViewDescription}
          onViewTxt={handleDetailViewTxt}
        />
      )}
    </div>
  );
};

// Inline-Modal für die Angebotsbeschreibung (unverändert)
const DescriptionModal = ({ offer, onClose }) => {
  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Offer Description</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p>{offer.description}</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// DetailViewModal als Navigations-Hub mit orangefarbenen Buttons und Back-Button
const DetailViewModal = ({ offer, onClose, onViewComments, onViewDescription, onViewTxt }) => {
  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog">
         <div className="modal-content" style={{ backgroundColor: "#006C84", marginTop: "10rem" }}>
           <div className="modal-header">
             <h5 className="modal-title" style={{ color: "white" }}>
               Detailansicht - {offer.name}
             </h5>
             <button type="button" className="btn-close" onClick={onClose}></button>
           </div>
           <div className="modal-body d-flex flex-column gap-2">
             <button
               className="btn"
               style={{ backgroundColor: "#ffccbb", border: "none" }}
               onClick={onViewComments}
             >
               View Comments
             </button>
             <button
               className="btn"
               style={{ backgroundColor: "#ffccbb", border: "none" }}
               onClick={onViewDescription}
             >
               View Description
             </button>
             <button
               className="btn"
               style={{ backgroundColor: "#ffccbb", border: "none" }}
               onClick={onViewTxt}
             >
               📄.txt
             </button>
           </div>
           <div className="modal-footer d-flex justify-content-start">
             <button className="btn btn-secondary" onClick={onClose}>
               Back
             </button>
           </div>
         </div>
      </div>
    </div>
  );
};

export default OffersList;






