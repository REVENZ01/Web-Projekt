import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../CSS/Customers.css";
import EditCustomer from "./EditCustomer.js"; // Importiere die Edit-Modal-Komponente
import { getAuthValue } from "./Header"; // Korrekt importieren

const Customers = ({ userGroup }) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    address: "",
    contact: "", // Neues Feld für Telefonnummer
  });

  // Zustände für die Filterung
  const [filterCustomer, setFilterCustomer] = useState({
    name: "",
    email: "",
    address: "",
    contact: "", // Optional: Filter für Telefonnummer
  });
  const [showFilters, setShowFilters] = useState(false);

  const authValue = getAuthValue(userGroup);

  useEffect(() => {
    fetchCustomers();
  }, [userGroup]);

  // fetchCustomers akzeptiert optional Filter-Parameter (als Query-Parameter)
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
          placeholder="Address"
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
        <button className="btn btn-primary" onClick={handleAddCustomer}>
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
                setFilterCustomer({ ...filterCustomer, address: e.target.value })
              }
            />
            <input
              type="text"
              className="form-control"
              placeholder="Filter by Contact"
              value={filterCustomer.contact}
              onChange={(e) =>
                setFilterCustomer({ ...filterCustomer, contact: e.target.value })
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
        {customers.length > 0 ? (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Address</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.address}</td>
                  <td>{customer.contact}</td>
                  <td>
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
                      Delete
                    </button>
                  </td>
                </tr>
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

