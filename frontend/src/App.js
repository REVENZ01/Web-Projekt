import React, { useState } from "react";
import OffersList from "./components/OffersList";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Customers from "./components/Customers";
import Home from "./components/Home";
import TagSearchPage from "./components/TagSearchPage"; // Neue Komponente
import "./App.css";

function App() {
  const [userGroup, setUserGroup] = useState("Basic User");
  const [currentPage, setCurrentPage] = useState("home");
  const [offerToShow, setOfferToShow] = useState(null);

  // Funktion zur Benutzergruppenänderung
  const handleGroupChange = (group) => {
    setUserGroup(group);
    console.log(`Selected User Group: ${group}`);
  };

  // Funktion zur Navigation
  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  // Funktion, um von Customers zur Detailansicht eines Offers zu navigieren
  const handleShowOfferDetail = (offer) => {
    setOfferToShow(offer);
    setCurrentPage("offers");
  };

  // Reset für das globale Offer (wird beim Schließen der Detailansicht aufgerufen)
  const resetOfferToShow = () => {
    setOfferToShow(null);
  };

  // Seitenrendering basierend auf currentPage
  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Home />;
      case "offers":
        return (
          <OffersList
            userGroup={userGroup}
            offerToShow={offerToShow}
            onResetOfferToShow={resetOfferToShow}
          />
        );
      case "customers":
        return (
          <Customers
            userGroup={userGroup}
            onShowOfferDetail={handleShowOfferDetail}
          />
        );
      case "services":
        return <h1>Our Services</h1>;
      case "contact":
        return <h1>Contact Us</h1>;
      case "tag-search":
        return <TagSearchPage userGroup={userGroup} />;
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



