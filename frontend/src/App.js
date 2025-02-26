// Grundlegende Importe für die Anwendung
import React, { useState } from "react";
import OffersList from "./components/OffersList";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Customers from "./components/Customers";
import Home from "./components/Home";
import TagSearchPage from "./components/TagSearchPage";
import "./App.css";

function App() {
  // Zentrale State-Verwaltung für Benutzergruppe, aktuelle Seite und anzuzeigendes Angebot
  const [userGroup, setUserGroup] = useState("Basic User");
  const [currentPage, setCurrentPage] = useState("home");
  const [offerToShow, setOfferToShow] = useState(null);

  // Handler für Benutzergruppen-Wechsel
  const handleGroupChange = (group) => {
    setUserGroup(group);
    console.log(`Selected User Group: ${group}`);
  };

  // Handler für Seitennavigation
  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  // Handler für Detailansicht von Angeboten aus der Kundenliste
  const handleShowOfferDetail = (offer) => {
    setOfferToShow(offer);
    setCurrentPage("offers");
  };

  // Zurücksetzen des ausgewählten Angebots
  const resetOfferToShow = () => {
    setOfferToShow(null);
  };

  // Zentrale Routing-Logik für Seitenauswahl
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
      case "tag-search":
        return <TagSearchPage userGroup={userGroup} />;
      default:
        return <h1>Page Not Found</h1>;
    }
  };

  // Haupt-Rendering der Anwendung mit Header, Content und Footer
  return (
    <div className="App">
      <Header onGroupChange={handleGroupChange} onNavigate={handleNavigation} />
      <main>{renderPage()}</main>
      <Footer />
    </div>
  );
}

export default App;



