import React, { useState, useEffect } from "react";
import "../CSS/Customers.css";



const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    contact: "",
    address: "",
  });

  // Fetch customers from API
  useEffect(() => {
    fetch("http://localhost:8080/customers")
      .then((response) => response.json())
      .then((data) => setCustomers(data))
      .catch((error) => console.error("Error fetching customers:", error));
  }, []);

  // Add a new customer
  const handleAddCustomer = () => {
    fetch("http://localhost:8080/customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newCustomer),
    })
      .then((response) => response.json())
      .then((customer) => {
        setCustomers([...customers, customer]);
        setNewCustomer({ name: "", contact: "", address: "" });
      })
      .catch((error) => console.error("Error adding customer:", error));
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
          id="email"
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
              </li>
            ))}
          </ul>
        ) : (
          <p>No customers found.</p>
        )}
      </div>
    </div>
  );
};

export default Customers;
