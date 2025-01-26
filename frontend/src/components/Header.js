import React, { useState } from "react";
import "../CSS/Header.css"; // Für die Stilgestaltung

const Header = ({ onGroupChange, onNavigate }) => {
  const [selectedGroup, setSelectedGroup] = useState("Admin");

  const handleGroupChange = (event) => {
    const group = event.target.value;
    setSelectedGroup(group);
    onGroupChange(group); // Callback, um die Auswahl an die App zu übergeben
  };

  return (
    <header className="header">
      <div className="logo">
        <a href="/">MyWebsite</a>
      </div>

      {/* Navigation Buttons */}
      <nav style={{ display: "flex", justifyContent: "center", gap: "15px", margin: "20px 0" }}>
        <button className="buttonHeader" onClick={() => onNavigate("home")}>Home</button>
        <button className="buttonHeader"onClick={() => onNavigate("offers")}>Offers</button>
        <button className="buttonHeader"onClick={() => onNavigate("customers")}>Customers</button>
        <button className="buttonHeader"onClick={() => onNavigate("services")}>Services</button>
        <button className="buttonHeader"onClick={() => onNavigate("contact")}>Contact</button>
      </nav>

      {/* User Group Dropdown */}
      <div className="user-dropdown">
        <label htmlFor="user-group" className="dropdown-label">User Group:</label>
        <select
          id="user-group"
          value={selectedGroup}
          onChange={handleGroupChange}
          className="dropdown"
        >
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
          <option value="User">User</option>
        </select>
      </div>
    </header>
  );
};

export default Header;


