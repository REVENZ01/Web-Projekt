import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../CSS/Customers.css";
import EditCustomer from "./EditCustomer.js"; // Importiere die neue Edit-Modal-Komponente
import { getAuthValue } from "./Header"; // Korrekt importieren

const Customers = ({ userGroup }) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    contact: "",
    address: "",
  });

  const authValue = getAuthValue(userGroup);

  useEffect(() => {
    fetchCustomers();
  }, [userGroup]);

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

  const handleAddCustomer = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/customers",
        newCustomer,
        { headers: { Authorization: authValue } }
      );
      setCustomers([...customers, response.data]);
      setNewCustomer({ name: "", contact: "", address: "" });
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
          placeholder="Contact"
          value={newCustomer.contact}
          onChange={(e) =>
            setNewCustomer({ ...newCustomer, contact: e.target.value })
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
        <button className="btn btn-primary" onClick={handleAddCustomer}>
          Add Customer
        </button>
      </div>
      <div className="customer-list">
        <h2>Customer List</h2>
        {customers.length > 0 ? (
          <ul className="list-group">
            {customers.map((customer) => (
              <li
                key={customer.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>
                  <strong>{customer.name}</strong> - {customer.contact} -{" "}
                  {customer.address}
                </span>
                <div>
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
                </div>
              </li>
            ))}
          </ul>
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
