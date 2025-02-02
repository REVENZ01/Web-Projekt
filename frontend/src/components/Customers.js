import React, { useState, useEffect } from "react";
import "../CSS/Customers.css";
import EditCustomer from "./EditCustomer.js"; // Importiere die neue Edit-Modal-Komponente

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    contact: "",
    address: "",
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch("http://localhost:8080/customers");
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleAddCustomer = async () => {
    try {
      const response = await fetch("http://localhost:8080/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCustomer),
      });
      const customer = await response.json();
      setCustomers([...customers, customer]);
      setNewCustomer({ name: "", contact: "", address: "" });
    } catch (error) {
      console.error("Error adding customer:", error);
    }
  };

  const handleDeleteCustomer = async (id) => {
    try {
      await fetch(`http://localhost:8080/customers/${id}`, {
        method: "DELETE",
      });
      setCustomers(customers.filter((customer) => customer.id !== id));
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  const handleUpdateCustomer = async (updatedCustomer) => {
    try {
      const response = await fetch(
        `http://localhost:8080/customers/${updatedCustomer.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedCustomer),
        }
      );
      const data = await response.json();
      setCustomers(
        customers.map((customer) => (customer.id === data.id ? data : customer))
      );
      setSelectedCustomer(null);
    } catch (error) {
      console.error("Error updating customer:", error);
    }
  };

  return (
    <div className="customers">
      <h1>Customers</h1>
      <div className="customer-form">
        <h2>Add a New Customer</h2>
        <input
          type="text"
          placeholder="Name"
          value={newCustomer.name}
          onChange={(e) =>
            setNewCustomer({ ...newCustomer, name: e.target.value })
          }
        />
        <input
          type="email"
          placeholder="Contact"
          value={newCustomer.contact}
          onChange={(e) =>
            setNewCustomer({ ...newCustomer, contact: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Address"
          value={newCustomer.address}
          onChange={(e) =>
            setNewCustomer({ ...newCustomer, address: e.target.value })
          }
        />
        <button onClick={handleAddCustomer}>Add Customer</button>
      </div>
      <div className="customer-list">
        <h2>Customer List</h2>
        {customers.length > 0 ? (
          <ul>
            {customers.map((customer) => (
              <li key={customer.id}>
                <strong>{customer.name}</strong> - {customer.contact} -{" "}
                {customer.address}
                <button onClick={() => setSelectedCustomer(customer)}>
                  Edit
                </button>
                <button onClick={() => handleDeleteCustomer(customer.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No customers found.</p>
        )}
      </div>

      {/* Integriere die neue EditCustomerModal-Komponente */}
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
