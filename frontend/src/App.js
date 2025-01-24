import React, { useState } from "react";
import OffersList from "./components/OffersList";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Customers from "./components/Customers";

function App() {
  const [userGroup, setUserGroup] = useState("Admin");
  const [currentPage, setCurrentPage] = useState("home");

  // Funktion zur Benutzergruppenänderung
  const handleGroupChange = (group) => {
    setUserGroup(group);
    console.log(`Selected User Group: ${group}`);
  };

  // Funktion zum Ändern der Seite
  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  // Funktion zur Anzeige der aktuellen Seite
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

  // Logik für Aktionen je nach Benutzergruppe
  const handleOfferAction = () => {
    if (userGroup === "Admin") {
      alert("Admin: Can modify and delete all offers.");
    } else if (userGroup === "Manager") {
      alert("Manager: Can approve offers.");
    } else {
      alert("User: Can view offers only.");
    }
  };

  return (
    <div>
      {/* Header mit Navigation und Benutzergruppenauswahl */}
      <Header onGroupChange={handleGroupChange} onNavigate={handleNavigation} />

      {/* Dynamischer Seiteninhalt */}
      <main style={{ padding: "20px" }}>
        {renderPage()}

        {/* Benutzergruppenspezifische Aktion */}
        <h1>Welcome, {userGroup}!</h1>
        <button onClick={handleOfferAction} className="offer-action-btn">
          Perform Offer Action
        </button>

        {/* Offers Management */}
        <h1 style={{ textAlign: "center", margin: "20px 0" }}>Offer Management</h1>
        <OffersList />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;

