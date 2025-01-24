import React, { useState } from "react";
import "../CSS/Header.css"; // Für die Stilgestaltung
import Customers from "./Customers";



const Header = ({ onGroupChange }) => {
  const [selectedGroup, setSelectedGroup] = useState("Admin");
  const [currentPage, setCurrentPage] = useState("home");
  
const handleGroupChange = (event) => {
    const group = event.target.value;
    setSelectedGroup(group);
    onGroupChange(group); // Callback, um die Auswahl an die App zu übergeben
  };


    // Funktion zum Ändern der Seite
    const handleNavigation = (page) => {
        setCurrentPage(page);
      };



 // Inhalte für die einzelnen Seiten
  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <h1>Welcome to Home</h1>;
      case "about":
        return <h1>About Us</h1>;
      case "customers":
        return <Customers />;
      case "services":
        return <h1>Our Services</h1>;
      case "contact":
        return <h1>Contact Us</h1>;
      default:
        return <h1>Page Not Found</h1>;
    }
  };





  return (
    <header className="header">
      <div className="logo">
        <a href="/">MyWebsite</a>
      </div>
     
      <nav style={{ display: "flex", justifyContent: "center", gap: "15px", margin: "20px 0" }}>
        <button onClick={() => handleNavigation("home")}>Home</button>
        <button onClick={() => handleNavigation("about")}>About</button>
        <button onClick={() => handleNavigation("customers")}>Customers</button>
        <button onClick={() => handleNavigation("services")}>Services</button>
        <button onClick={() => handleNavigation("contact")}>Contact</button>
      </nav>


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
