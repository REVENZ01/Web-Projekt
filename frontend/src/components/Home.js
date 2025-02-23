import React from "react";
import "../CSS/Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <h1 className="home-title">Prismarine Solutions</h1>
      <div className="feature-grid">
        <div className="feature-box">
          <h3>Über uns</h3>
          <p>
            Prismarine Solutions ist Ihr zuverlässiger Partner im Bereich digitales
            Angebotsmanagement. Wir bieten moderne Lösungen zur Optimierung von
            Arbeitsabläufen, wodurch Unternehmen ihre Effizienz steigern können.
            Unser Ziel ist es, die Digitalisierung von Geschäftsprozessen einfach
            und zugänglich zu machen.
          </p>
        </div>
        <div className="feature-box">
          <h3>Unsere Leistungen</h3>
          <p>
            Unsere Plattform bietet umfassende Funktionen zur Angebotsverwaltung,
            Kundenbetreuung und Dateiverwaltung. Wir unterstützen Unternehmen
            dabei, ihre Prozesse zu optimieren und wertvolle Zeit einzusparen.
          </p>
        </div>
        <div className="feature-box">
          <h3>Effizientes Angebotsmanagement</h3>
          <p>
            Von der Erstellung bis zur Nachverfolgung – unser System hilft Ihnen,
            Angebote effizient zu verwalten und schneller abzuwickeln.
          </p>
        </div>
        <div className="feature-box">
          <h3>Kundenbetreuung leicht gemacht</h3>
          <p>
            Behalten Sie den Überblick über Kundeninteraktionen und verwalten Sie
            Kundenbeziehungen mit einem zentralisierten System.
          </p>
        </div>
        <div className="feature-box">
          <h3>Sichere Dokumentenspeicherung</h3>
          <p>
            Alle relevanten Dokumente werden sicher gespeichert und sind jederzeit
            für autorisierte Nutzer abrufbar.
          </p>
        </div>
        <div className="feature-box">
          <h3>Warum Prismarine Solutions?</h3>
          <p>
            Unsere Plattform ist intuitiv, leistungsstark und flexibel. Wir bieten
            maßgeschneiderte Lösungen, um den individuellen Anforderungen Ihres
            Unternehmens gerecht zu werden. Unsere Kunden profitieren von schneller
            Implementierung, einfacher Bedienbarkeit und kontinuierlichem Support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;


