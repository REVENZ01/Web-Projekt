import React, { useState } from "react";
import OffersList from "./components/OffersList";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Customers from "./components/Customers";
import Home from "./components/Home";

function App() {
  const [userGroup, setUserGroup] = useState("Basic User"); // Benutzergruppe speichern
  const [currentPage, setCurrentPage] = useState("home");

  // Funktion zur Benutzergruppenänderung
  const handleGroupChange = (group) => {
    setUserGroup(group);
    console.log(`Selected User Group: ${group}`);
  };

  // Funktion zur Navigation
  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  // Seitenrendering basierend auf `currentPage`
  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Home />;
      case "offers":
        return <OffersList userGroup={userGroup} />;
      case "customers":
        return <Customers userGroup={userGroup} />;
      case "services":
        return <h1>Our Services</h1>;
      case "contact":
        return <h1>Contact Us</h1>;
      default:
        return <h1>Page Not Found</h1>;
    }
  };

  return (
    <div className="App">
      <Header onGroupChange={handleGroupChange} onNavigate={handleNavigation} />
      <main>{renderPage()}</main>
      <Footer />
    </div>
  );
}

export default App;
