import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../CSS/Customers.css";
import EditCustomer from "./EditCustomer.js"; // Importiere die Komponente zum Bearbeiten eines Kunden
import { getAuthValue } from "./Header"; // Importiere die Funktion zur Authentifizierung

/**
 * Komponente Customers
 * Zeigt eine Liste von Kunden und deren zugehörige Angebote an.
 * Ermöglicht das Hinzufügen, Bearbeiten, Löschen und Filtern von Kunden.
 *
 * Props:
 * - userGroup: Die Benutzergruppe des aktuell angemeldeten Nutzers (für Authentifizierung)
 * - onShowOfferDetail: Callback, um Detailansichten von Angeboten anzuzeigen
 */
const Customers = ({ userGroup, onShowOfferDetail }) => {
  // State zur Speicherung der Kundenliste
  const [customers, setCustomers] = useState([]);
  // State zur Speicherung der Angebote (Offers)
  const [offers, setOffers] = useState([]);
  // State für den aktuell ausgewählten Kunden (zur Bearbeitung)
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  // State für ein neues Kundenformular
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    address: "",
    contact: "",
  });
  // State für IDs der Kunden, deren Angebote aktuell angezeigt werden (Detailansicht)
  const [expandedCustomerIds, setExpandedCustomerIds] = useState([]);

  // States für Filter-Felder
  const [filterCustomer, setFilterCustomer] = useState({
    name: "",
    email: "",
    address: "",
    contact: "",
  });
  // State, ob der Filterbereich angezeigt wird oder nicht
  const [showFilters, setShowFilters] = useState(false);

  // Hole den Authentifizierungswert anhand der Benutzergruppe
  const authValue = getAuthValue(userGroup);

  // Beim Laden der Komponente (oder wenn sich die Benutzergruppe ändert),
  // werden Kunden und Angebote vom Server abgerufen.
  useEffect(() => {
    fetchCustomers();
    fetchOffers();
  }, [userGroup]);

  /**
   * Ruft die Kunden vom Server ab.
   * Optional können Filterkriterien übergeben werden.
   */
  const fetchCustomers = async (filters = {}) => {
    try {
      const response = await axios.get("http://localhost:8080/customers", {
        headers: { Authorization: authValue },
        params: filters,
      });
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  /**
   * Ruft alle Angebote vom Server ab.
   */
  const fetchOffers = async () => {
    try {
      const response = await axios.get("http://localhost:8080/offers", {
        headers: { Authorization: authValue },
      });
      setOffers(response.data);
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  };

  /**
   * Fügt einen neuen Kunden hinzu.
   * Validiert, ob die Email ein "@" enthält und ob der Contact eine gültige Ganzzahl ist.
   */
  const handleAddCustomer = async () => {
    // Email muss ein "@" enthalten
    if (!newCustomer.email.includes("@")) {
      alert("Die Email-Adresse muss ein '@' enthalten.");
      return;
    }
    // Contact muss eine gültige Ganzzahl sein
    const contactValue = parseInt(newCustomer.contact, 10);
    if (isNaN(contactValue)) {
      alert("Das Contact-Feld muss eine gültige Ganzzahl sein.");
      return;
    }
    try {
      const payload = { ...newCustomer, contact: contactValue };
      const response = await axios.post(
        "http://localhost:8080/customers",
        payload,
        { headers: { Authorization: authValue } }
      );
      // Füge den neu erstellten Kunden zur Liste hinzu
      setCustomers([...customers, response.data]);
      // Setze das Formular zurück
      setNewCustomer({ name: "", email: "", address: "", contact: "" });
    } catch (error) {
      console.error("Error adding customer:", error);
    }
  };

  /**
   * Löscht einen Kunden anhand der ID.
   */
  const handleDeleteCustomer = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/customers/${id}`, {
        headers: { Authorization: authValue },
      });
      // Aktualisiere den State, indem der gelöschte Kunde entfernt wird
      setCustomers(customers.filter((customer) => customer.id !== id));
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  /**
   * Aktualisiert einen Kunden.
   * Wird beim Speichern der Bearbeitungen in der EditCustomer-Modal-Komponente aufgerufen.
   */
  const handleUpdateCustomer = async (updatedCustomer) => {
    try {
      const response = await axios.put(
        `http://localhost:8080/customers/${updatedCustomer.id}`,
        updatedCustomer,
        { headers: { Authorization: authValue } }
      );
      const updatedData = response.data;
      // Ersetze den alten Kundeneintrag mit dem aktualisierten
      setCustomers(
        customers.map((customer) =>
          customer.id === updatedData.id ? updatedData : customer
        )
      );
      setSelectedCustomer(null); // Schließe die Edit-Modal
    } catch (error) {
      console.error("Error updating customer:", error);
    }
  };

  /**
   * Filtert die Kunden anhand der eingegebenen Filterkriterien.
   */
  const handleFilterCustomers = () => {
    fetchCustomers(filterCustomer);
  };

  /**
   * Löscht die Filterkriterien und ruft alle Kunden erneut ab.
   */
  const handleClearFilter = () => {
    setFilterCustomer({ name: "", email: "", address: "", contact: "" });
    fetchCustomers({});
  };

  /**
   * Berechnet die Summe der Preise aller Angebote eines bestimmten Kunden.
   * @param {string} customerId - Die ID des Kunden.
   * @returns {number} Die Summe der Angebote.
   */
  const getOfferSumForCustomer = (customerId) => {
    const customerOffers = offers.filter(
      (offer) => offer.customerId === customerId
    );
    return customerOffers.reduce((sum, offer) => sum + Number(offer.price), 0);
  };

  /**
   * Sortiert die Kunden so, dass der Kunde mit der höchsten Angebotssumme oben steht.
   */
  const sortedCustomers = [...customers].sort((a, b) => {
    const sumA = getOfferSumForCustomer(a.id);
    const sumB = getOfferSumForCustomer(b.id);
    return sumB - sumA;
  });

  /**
   * Wechselt den Zustand, ob die Angebote eines Kunden angezeigt werden.
   * @param {string} customerId - Die ID des Kunden.
   */
  const toggleCustomerOffers = (customerId) => {
    if (expandedCustomerIds.includes(customerId)) {
      setExpandedCustomerIds(expandedCustomerIds.filter((id) => id !== customerId));
    } else {
      setExpandedCustomerIds([...expandedCustomerIds, customerId]);
    }
  };

  return (
    <div className="container mt-4">
      <h1>Customers</h1>
      {/* Formular zum Hinzufügen eines neuen Kunden */}
      <div className="customer-form mb-4">
        <h2>Add a New Customer</h2>
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Name"
          value={newCustomer.name}
          onChange={(e) =>
            setNewCustomer({ ...newCustomer, name: e.target.value })
          }
        />
        <input
          type="email"
          className="form-control mb-2"
          placeholder="✉ Email"
          value={newCustomer.email}
          onChange={(e) =>
            setNewCustomer({ ...newCustomer, email: e.target.value })
          }
        />
        <input
          type="text"
          className="form-control mb-2"
          placeholder="🏠︎ Address"
          value={newCustomer.address}
          onChange={(e) =>
            setNewCustomer({ ...newCustomer, address: e.target.value })
          }
        />
        <input
          type="number"
          className="form-control mb-2"
          placeholder="☏ Contact"
          value={newCustomer.contact}
          onChange={(e) =>
            setNewCustomer({ ...newCustomer, contact: e.target.value })
          }
        />
        <button
          className="btn btn-secondary"
          style={{ backgroundColor: "#006C84" }}
          onClick={handleAddCustomer}
        >
          Add Customer
        </button>
      </div>

      {/* Liste der Kunden */}
      <div className="customer-list">
        <h2>Customer List</h2>
        {/* Button zum Anzeigen bzw. Verbergen des Filterbereichs */}
        <div className="mb-3">
          <button
            className="btn btn-outline-primary"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
        {/* Filterbereich */}
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
              value={filterCustomer.name}
              onChange={(e) =>
                setFilterCustomer({ ...filterCustomer, name: e.target.value })
              }
            />
            <input
              type="text"
              className="form-control"
              placeholder="Filter by Email"
              value={filterCustomer.email}
              onChange={(e) =>
                setFilterCustomer({ ...filterCustomer, email: e.target.value })
              }
            />
            <input
              type="text"
              className="form-control"
              placeholder="Filter by Address"
              value={filterCustomer.address}
              onChange={(e) =>
                setFilterCustomer({
                  ...filterCustomer,
                  address: e.target.value,
                })
              }
            />
            <input
              type="number"
              className="form-control"
              placeholder="Filter by Contact"
              value={filterCustomer.contact}
              onChange={(e) =>
                setFilterCustomer({
                  ...filterCustomer,
                  contact: e.target.value,
                })
              }
            />
            <button
              className="btn btn-secondary"
              onClick={handleFilterCustomers}
            >
              Filter Customers
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={handleClearFilter}
            >
              Clear Filter
            </button>
          </div>
        )}
        {/* Anzeige der Kundenliste */}
        {sortedCustomers.length > 0 ? (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Address</th>
                <th>Contact</th>
                <th>Angebotssumme</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedCustomers.map((customer) => (
                <React.Fragment key={customer.id}>
                  <tr>
                    <td>{customer.id}</td>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.address}</td>
                    <td>{customer.contact}</td>
                    <td>{getOfferSumForCustomer(customer.id)}</td>
                    <td>
                      {/* Button zum Umschalten der Angebotsansicht */}
                      <button
                        className="btn btn-secondary btn-sm me-2"
                        onClick={() => toggleCustomerOffers(customer.id)}
                      >
                        {expandedCustomerIds.includes(customer.id)
                          ? "Hide Offers"
                          : "Show Offers"}
                      </button>
                      {/* Button zum Bearbeiten eines Kunden */}
                      <button
                        className="btn btn-secondary btn-sm me-2"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        Edit
                      </button>
                      {/* Button zum Löschen eines Kunden */}
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteCustomer(customer.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                  {/* Detailansicht: Anzeigen der Angebote eines Kunden */}
                  {expandedCustomerIds.includes(customer.id) && (
                    <tr>
                      <td colSpan="7">
                        <div style={{ margin: "10px 0" }}>
                          <h5>Offers for {customer.name}:</h5>
                          {offers.filter((offer) => offer.customerId === customer.id)
                            .length > 0 ? (
                            <table className="table table-bordered">
                              <thead>
                                <tr>
                                  <th>Offer ID</th>
                                  <th>Name</th>
                                  <th>Price</th>
                                  <th>Status</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {offers
                                  .filter((offer) => offer.customerId === customer.id)
                                  .map((offer) => (
                                    <tr key={offer.id}>
                                      <td>{offer.id}</td>
                                      <td>{offer.name}</td>
                                      <td>{offer.price}</td>
                                      <td>{offer.status}</td>
                                      <td>
                                        <button
                                          className="btn btn-secondary btn-sm"
                                          onClick={() => onShowOfferDetail(offer)}
                                        >
                                          Detailansicht
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          ) : (
                            <p>No offers found for this customer.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No customers found.</p>
        )}
      </div>

      {/* Anzeige des EditCustomer-Modals zum Bearbeiten eines Kunden */}
      {selectedCustomer && (
        <EditCustomer
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onSave={handleUpdateCustomer}
        />
      )}
    </div>
  );
};

export default Customers;







