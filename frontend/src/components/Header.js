import React, { useState, useEffect } from "react";
import "../CSS/Header.css"; // Für die Stilgestaltung
import { seedAllData } from "./seedData"; // Importieren der Seed-Funktion

/**
 * getAuthValue
 * Erzeugt den Auth-Header-Wert basierend auf der übergebenen User-Gruppe.
 *
 * @param {string} group - Die User-Gruppe.
 * @returns {string} Den entsprechenden Auth-Header-Wert.
 */
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

/**
 * Header
 * Hauptkomponente für den Seitenheader, der Navigation, Benutzergruppen-Auswahl und den Seed Data Button umfasst.
 *
 * @param {Object} props - Enthält onGroupChange, onNavigate und userGroup.
 * @returns {JSX.Element} Das gerenderte Header-Element.
 */
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

  /**
   * handleSeedData
   * Ruft die Seed-Funktion auf, um Testdaten zu erzeugen, und lädt die Seite anschließend neu.
   */
  const handleSeedData = async () => {
    try {
      await seedAllData(selectedGroup);
      window.location.reload();
    } catch (error) {
      console.error("Error seeding data:", error);
      alert("Rolle -User- darf keine Testdaten erzeugen!");
    }
  };

  return (
    <header className="header">
      <div className="logo">
        <a href="/">
          <img className="homebild" src="/Prismarin.gif" alt="Prismarin" />
        </a>
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
        <button
          className="buttonHeader"
          onClick={() => onNavigate("tag-search")}
        >
          Tag Search
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

