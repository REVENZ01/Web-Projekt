import React from "react";
import "../CSS/Footer.css"; // Für die Stilgestaltung

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p>
          &copy; {new Date().getFullYear()} Dein Unternehmen. Alle Rechte
          vorbehalten.
        </p>
        <ul className="footer-links">
          <li>
            <a href="/impressum">Impressum</a>
          </li>
          <li>
            <a href="/datenschutz">Datenschutz</a>
          </li>
          <li>
            <a href="/kontakt">Kontakt</a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
