import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../CSS/Customers.css";
import EditCustomer from "./EditCustomer.js"; // Importiere die Edit-Modal-Komponente
import { getAuthValue } from "./Header"; // Korrekt importieren

const Customers = ({ userGroup, onShowOfferDetail }) => {
  const [customers, setCustomers] = useState([]);
  const [offers, setOffers] = useState([]); // Neuer State für Angebote
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    address: "",
    contact: "",
  });
  // State für aufgeklappte Kunden (zur Anzeige der zugehörigen Offers)
  const [expandedCustomerIds, setExpandedCustomerIds] = useState([]);

  // Zustände für die Filterung
  const [filterCustomer, setFilterCustomer] = useState({
    name: "",
    email: "",
    address: "",
    contact: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const authValue = getAuthValue(userGroup);

  useEffect(() => {
    fetchCustomers();
    fetchOffers();
  }, [userGroup]);

  // Holt alle Kunden
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

  // Holt alle Angebote
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

  const handleAddCustomer = async () => {
    // Prüfen, ob in der Email ein "@" enthalten ist
    if (!newCustomer.email.includes("@")) {
      alert("Die Email-Adresse muss ein '@' enthalten.");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:8080/customers",
        newCustomer,
        { headers: { Authorization: authValue } }
      );
      setCustomers([...customers, response.data]);
      setNewCustomer({ name: "", email: "", address: "", contact: "" });
    } catch (error) {
      console.error("Error adding customer:", error);
    }
  };

  const handleDeleteCustomer = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/customers/${id}`, {
        headers: { Authorization: authValue },
      });
      setCustomers(customers.filter((customer) => customer.id !== id));
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  const handleUpdateCustomer = async (updatedCustomer) => {
    try {
      const response = await axios.put(
        `http://localhost:8080/customers/${updatedCustomer.id}`,
        updatedCustomer,
        { headers: { Authorization: authValue } }
      );
      const updatedData = response.data;
      setCustomers(
        customers.map((customer) =>
          customer.id === updatedData.id ? updatedData : customer
        )
      );
      setSelectedCustomer(null);
    } catch (error) {
      console.error("Error updating customer:", error);
    }
  };

  const handleFilterCustomers = () => {
    fetchCustomers(filterCustomer);
  };

  const handleClearFilter = () => {
    setFilterCustomer({ name: "", email: "", address: "", contact: "" });
    fetchCustomers({});
  };

  // Berechne für einen Kunden die Summe aller zugeordneten Angebote.
  const getOfferSumForCustomer = (customerId) => {
    const customerOffers = offers.filter(
      (offer) => offer.customerId === customerId
    );
    return customerOffers.reduce((sum, offer) => sum + Number(offer.price), 0);
  };

  // Erstelle eine sortierte Kundenliste: Kunde mit höchster Angebotssumme oben
  const sortedCustomers = [...customers].sort((a, b) => {
    const sumA = getOfferSumForCustomer(a.id);
    const sumB = getOfferSumForCustomer(b.id);
    return sumB - sumA;
  });

  // Toggle-Funktion für die Detailansicht zu einem Kunden
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
          type="text"
          className="form-control mb-2"
          placeholder="☏ Contact"
          value={newCustomer.contact}
          onChange={(e) =>
            setNewCustomer({ ...newCustomer, contact: e.target.value })
          }
        />
        <button
          className="btn btn-primary"
          style={{ backgroundColor: "#006C84" }}
          onClick={handleAddCustomer}
        >
          Add Customer
        </button>
      </div>
      <div className="customer-list">
        <h2>Customer List</h2>
        {/* Button zum Ein-/Ausblenden des Filterbereichs */}
        <div className="mb-3">
          <button
            className="btn btn-outline-primary"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
        {showFilters && (
          <div
            className="mb-3 d-flex gap-2"
            style={{
              backgroundColor: "#e3f2fd",
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
              type="text"
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
                      <button
                        className="btn btn-info btn-sm me-2"
                        onClick={() => toggleCustomerOffers(customer.id)}
                      >
                        {expandedCustomerIds.includes(customer.id)
                          ? "Hide Offers"
                          : "Show Offers"}
                      </button>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteCustomer(customer.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
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
                                          className="btn btn-primary btn-sm"
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

      {/* Integriere die EditCustomer-Modal-Komponente */}
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





