import React, { useState, useEffect } from "react";
import axios from "axios";
import EditOfferModal from "./EditOfferModal";
import CommentsModal from "./CommentsModal";
import TextDataModal from "./textDataModal";
import "bootstrap/dist/css/bootstrap.min.css";
import { getAuthValue } from "./Header";
import "../CSS/Offers.css";

/**
 * OffersList
 * Hauptkomponente zur Anzeige, Verwaltung und Filterung von Angeboten.
 * Enthält Funktionen zum Abrufen, Hinzufügen, Bearbeiten und Löschen von Angeboten
 * sowie zur Verwaltung von Filtern und Modals.
 *
 * @param {Object} props - Enthält userGroup, offerToShow und onResetOfferToShow.
 * @returns {JSX.Element} Render der Angebote-Verwaltung.
 */
const OffersList = ({ userGroup, offerToShow, onResetOfferToShow }) => {
  const [offers, setOffers] = useState([]);
  const [onIceOffers, setOnIceOffers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [selectedCommentsOffer, setSelectedCommentsOffer] = useState(null);
  const [selectedFilesOffer, setSelectedFilesOffer] = useState(null);
  const [selectedDescriptionOffer, setSelectedDescriptionOffer] =
    useState(null);
  const [selectedDetailOffer, setSelectedDetailOffer] = useState(null);

  const [newOffer, setNewOffer] = useState({
    name: "",
    price: "",
    customerId: "",
    currency: "EUR",
    description: "",
    status: "Draft",
  });

  const [filterOffer, setFilterOffer] = useState({
    name: "",
    price: "",
    status: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showOnIceList, setShowOnIceList] = useState(false);

  const authValue = getAuthValue(userGroup);

  useEffect(() => {
    fetchOffers();
    fetchCustomers();
  }, [userGroup]);

  useEffect(() => {
    if (offerToShow) {
      setSelectedDetailOffer(offerToShow);
    }
  }, [offerToShow]);

  /**
   * fetchOffers
   * Ruft alle Angebote ab, filtert die "On Ice"-Angebote heraus und sortiert sie absteigend.
   *
   * @param {Object} filters - Optionale Filterparameter.
   */
  const fetchOffers = async (filters = {}) => {
    try {
      const response = await axios.get("http://localhost:8080/offers", {
        headers: { Authorization: authValue },
        params: filters,
      });
      const sortedOffers = response.data
        .filter((offer) => offer.status !== "On Ice")
        .sort((a, b) => b.id - a.id);
      setOffers(sortedOffers);
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  };

  /**
   * fetchOnIceOffers
   * Ruft ausschließlich Angebote mit dem Status "On Ice" ab und sortiert sie absteigend.
   */
  const fetchOnIceOffers = async () => {
    try {
      const response = await axios.get("http://localhost:8080/offers", {
        headers: { Authorization: authValue },
      });
      const iceOffers = response.data
        .filter((offer) => offer.status === "On Ice")
        .sort((a, b) => b.id - a.id);
      setOnIceOffers(iceOffers);
    } catch (error) {
      console.error("Error fetching On Ice offers:", error);
    }
  };

  /**
   * fetchCustomers
   * Ruft alle Kunden ab.
   */
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

  /**
   * handleAddOffer
   * Fügt ein neues Angebot hinzu, aktualisiert die Listen und öffnet die Detailansicht des neuen Angebots.
   */
  const handleAddOffer = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/offers",
        newOffer,
        {
          headers: { Authorization: authValue },
        }
      );
      const createdOffer = response.data;
      fetchOffers();
      if (createdOffer.status === "On Ice" && showOnIceList) {
        fetchOnIceOffers();
      }
      setNewOffer({
        name: "",
        price: "",
        customerId: "",
        currency: "EUR",
        description: "",
        status: "Draft",
      });
      setSelectedDetailOffer(createdOffer);
    } catch (error) {
      console.error("Error adding offer:", error);
    }
  };

  /**
   * handleDeleteOffer
   * Löscht ein Angebot anhand der ID und aktualisiert die Listen.
   *
   * @param {number} id - Die ID des zu löschenden Angebots.
   */
  const handleDeleteOffer = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/offers/${id}`, {
        headers: { Authorization: authValue },
      });
      fetchOffers();
      if (showOnIceList) {
        fetchOnIceOffers();
      }
    } catch (error) {
      console.error("Error deleting offer:", error);
    }
  };

  /**
   * handleUpdateOffer
   * Aktualisiert ein Angebot und passt die Listen entsprechend an.
   *
   * @param {Object} updatedOffer - Das aktualisierte Angebotsobjekt.
   */
  const handleUpdateOffer = async (updatedOffer) => {
    try {
      await axios.put(
        `http://localhost:8080/offers/${updatedOffer.id}`,
        updatedOffer,
        { headers: { Authorization: authValue } }
      );
      fetchOffers();
      if (showOnIceList) {
        fetchOnIceOffers();
      }
      setSelectedOffer(null);
    } catch (error) {
      console.error("Error updating offer:", error);
    }
  };

  /**
   * handleStatusChange
   * Aktualisiert den Status eines Angebots, passt die Listen und die Detailansicht an.
   *
   * @param {number} id - Die ID des Angebots.
   * @param {string} newStatus - Der neue Status.
   */
  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:8080/offers/${id}/status`,
        { newStatus },
        { headers: { Authorization: authValue } }
      );
      fetchOffers(filterOffer);
      if (showOnIceList) {
        fetchOnIceOffers();
      }
      if (selectedDetailOffer && selectedDetailOffer.id === id) {
        setSelectedDetailOffer({ ...selectedDetailOffer, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  /**
   * handleFilterOffers
   * Filtert die Angebote basierend auf den gesetzten Filterkriterien.
   */
  const handleFilterOffers = () => {
    fetchOffers(filterOffer);
  };

  /**
   * handleClearFilter
   * Setzt die Filter zurück und ruft alle Angebote ab.
   */
  const handleClearFilter = () => {
    setFilterOffer({ name: "", price: "", status: "" });
    fetchOffers({});
  };

  /**
   * handleAddSampleOffers
   * Fügt Beispielangebote hinzu über den Endpunkt "/offers/sample" und aktualisiert die Listen.
   */
  const handleAddSampleOffers = async () => {
    try {
      await axios.post(
        "http://localhost:8080/offers/sample",
        {},
        {
          headers: { Authorization: authValue },
        }
      );
      fetchOffers();
      if (showOnIceList) {
        fetchOnIceOffers();
      }
    } catch (error) {
      console.error("Error adding sample offers:", error);
    }
  };

  /**
   * handleDetailViewComments
   * Öffnet die Detailansicht für Kommentare.
   */
  const handleDetailViewComments = () => {
    setSelectedCommentsOffer(selectedDetailOffer);
    setSelectedDetailOffer(null);
  };

  /**
   * handleDetailViewDescription
   * Öffnet die Detailansicht für die Angebotsbeschreibung.
   */
  const handleDetailViewDescription = () => {
    setSelectedDescriptionOffer(selectedDetailOffer);
    setSelectedDetailOffer(null);
  };

  /**
   * handleDetailViewTxt
   * Öffnet die Detailansicht für Textdateien.
   */
  const handleDetailViewTxt = () => {
    setSelectedFilesOffer(selectedDetailOffer);
    setSelectedDetailOffer(null);
  };

  return (
    <div
      className="container mt-4 offers-container"
      style={{ marginTop: "2rem", marginBottom: "2rem" }}
    >
      <h2>Manage Offers</h2>
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
            onChange={(e) =>
              setNewOffer({ ...newOffer, price: e.target.value })
            }
          />
        </div>
        <div>
          <label>Currency</label>
          <select
            className="form-select"
            value={newOffer.currency}
            onChange={(e) =>
              setNewOffer({ ...newOffer, currency: e.target.value })
            }
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
        </div>
        <button
          className="btn btn-secondary"
          style={{ background: "#006C84" }}
          onClick={handleAddOffer}
        >
          Add Offer
        </button>
      </div>

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
            backgroundColor: "#fff",
            border: "1px solid #000",
            padding: "10px",
            borderRadius: "5px",
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
          </select>
          <button className="btn btn-secondary" onClick={handleFilterOffers}>
            Filter Offers
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={handleClearFilter}
          >
            Clear Filter
          </button>
        </div>
      )}

      <div className="mb-3">
        <button className="btn btn-secondary" onClick={handleAddSampleOffers}>
          Add legacy data
        </button>
      </div>

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
              <td>
                {customers.find((c) => c.id === offer.customerId)?.name ||
                  "None"}
              </td>
              <td>{offer.status}</td>
              <td>
                <button
                  className="btn btn-secondary me-2"
                  onClick={() => setSelectedDetailOffer(offer)}
                >
                  Detailansicht
                </button>
                <button
                  className="btn btn-secondary me-2"
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

      <div className="mb-3">
        <button
          className="btn btn-secondary"
          onClick={() => {
            const newState = !showOnIceList;
            setShowOnIceList(newState);
            if (newState) {
              fetchOnIceOffers();
            }
          }}
        >
          {showOnIceList ? "On-Ice ausblenden" : "Alle Angebote anzeigen"}
        </button>
      </div>

      {showOnIceList && (
        <>
          <h4>Angebote mit Status "On Ice"</h4>
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
              {onIceOffers.map((offer) => (
                <tr key={offer.id}>
                  <td>{offer.id}</td>
                  <td>{offer.name}</td>
                  <td>{offer.price}</td>
                  <td>{offer.currency}</td>
                  <td>
                    {customers.find((c) => c.id === offer.customerId)?.name ||
                      "None"}
                  </td>
                  <td>{offer.status}</td>
                  <td>
                    <button
                      className="btn btn-secondary me-2"
                      onClick={() => setSelectedDetailOffer(offer)}
                    >
                      Detailansicht
                    </button>
                    <button
                      className="btn btn-secondary me-2"
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
        </>
      )}

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
          onClose={() => {
            setSelectedDetailOffer(null);
            if (onResetOfferToShow) {
              onResetOfferToShow();
            }
          }}
          onViewComments={handleDetailViewComments}
          onViewDescription={handleDetailViewDescription}
          onViewTxt={handleDetailViewTxt}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

/**
 * DescriptionModal
 * Inline-Modal zur Anzeige der Angebotsbeschreibung.
 *
 * @param {Object} props - Enthält offer und onClose.
 * @returns {JSX.Element} Render des Description-Modals.
 */
const DescriptionModal = ({ offer, onClose }) => {
  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Offer Description</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
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

/**
 * DetailViewModal
 * Modal zur Anzeige der Detailansicht eines Angebots, mit Navigation zu Kommentaren,
 * Beschreibung und Textdateien sowie Statusänderung.
 *
 * @param {Object} props - Enthält offer, onClose, onViewComments, onViewDescription, onViewTxt und onStatusChange.
 * @returns {JSX.Element} Render des DetailView-Modals.
 */
const DetailViewModal = ({
  offer,
  onClose,
  onViewComments,
  onViewDescription,
  onViewTxt,
  onStatusChange,
}) => {
  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div
          className="modal-content"
          style={{ backgroundColor: "#006C84", marginTop: "10rem" }}
        >
          <div className="modal-header">
            <h5 className="modal-title" style={{ color: "white" }}>
              Detailansicht - {offer.name}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body d-flex flex-column gap-2">
            <div className="mb-3">
              <label className="form-label" style={{ color: "white" }}>
                Status:
              </label>
              <select
                className="form-select"
                value={offer.status}
                onChange={(e) => onStatusChange(offer.id, e.target.value)}
              >
                {offer.status === "Draft" ? (
                  <>
                    <option value="Draft" disabled>
                      Draft
                    </option>
                    <option value="Active">Active</option>
                    <option value="On Ice">On Ice</option>
                  </>
                ) : (
                  <>
                    <option value="Draft">Draft</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Active">Active</option>
                    <option value="On Ice">On Ice</option>
                  </>
                )}
              </select>
            </div>
            <button
              className="btn btn-secondary"
              style={{ backgroundColor: "#ffccbb", border: "none" }}
              onClick={onViewComments}
            >
              View Comments
            </button>
            <button
              className="btn btn-secondary"
              style={{ backgroundColor: "#ffccbb", border: "none" }}
              onClick={onViewDescription}
            >
              View Description
            </button>
            <button
              className="btn btn-secondary"
              style={{ backgroundColor: "#ffccbb", border: "none" }}
              onClick={onViewTxt}
            >
              📄.txt
            </button>
          </div>
          <div className="modal-footer d-flex justify-content-end">
            <button
              className="btn btn-secondary"
              style={{ backgroundColor: "#ffccbb", color: "black" }}
              onClick={onClose}
            >
              🗸
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffersList;



