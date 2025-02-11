// src/components/Header.js
import React, { useState, useEffect } from "react";
import "../CSS/Header.css"; // Für die Stilgestaltung
import { seedAllData } from "./seedData"; // Importieren der Seed-Funktion

// Funktion zur Generierung des Auth-Header-Werts basierend auf der User-Gruppe
export const getAuthValue = (group) => {
  switch (group) {
    case "Basic Account-Manager":
      return "Basic Account-Manager";
    case "Basic Developer":
      return "Basic Developer";
    case "Basic User":
      return "Basic User";
    default:
      return "Bearer StandardToken";
  }
};

const Header = ({ onGroupChange, onNavigate, userGroup }) => {
  const [selectedGroup, setSelectedGroup] = useState(userGroup || "Basic User");

  useEffect(() => {
    setSelectedGroup(userGroup);
  }, [userGroup]);

  const handleGroupChange = (event) => {
    const group = event.target.value;
    setSelectedGroup(group);
    onGroupChange(group);
  };

  // Handler zum direkten Aufruf der Seed-Funktion, ohne Navigation
  const handleSeedData = async () => {
    try {
      await seedAllData(selectedGroup);
      alert("Seed Data erfolgreich erzeugt.");
    } catch (error) {
      console.error("Error seeding data:", error);
      alert("Beim Erzeugen der Seed Data ist ein Fehler aufgetreten.");
    }
  };

  return (
    <header className="header">
      <div className="logo">
        <a href="/">MyWebsite</a>
      </div>

      <nav className="main-nav">
        <button className="buttonHeader" onClick={() => onNavigate("home")}>
          Home
        </button>
        <button className="buttonHeader" onClick={() => onNavigate("offers")}>
          Offers
        </button>
        <button
          className="buttonHeader"
          onClick={() => onNavigate("customers")}
        >
          Customers
        </button>
        <button className="buttonHeader" onClick={() => onNavigate("contact")}>
          Contact
        </button>
      </nav>

      {/* Extra Container für den Seed Data Button, rechts positioniert */}
      <div className="seed-button-container">
        <button className="seedButton" onClick={handleSeedData}>
          Seed Data
        </button>
      </div>

      <div className="user-dropdown">
        <label htmlFor="user-group" className="dropdown-label">
          User Group:
        </label>
        <select
          id="user-group"
          value={selectedGroup}
          onChange={handleGroupChange}
          className="dropdown"
        >
          <option value="Basic Account-Manager">Account-Manager</option>
          <option value="Basic Developer">Developer</option>
          <option value="Basic User">User</option>
        </select>
      </div>
    </header>
  );
};

export default Header;
