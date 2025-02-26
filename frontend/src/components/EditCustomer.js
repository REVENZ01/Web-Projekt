import React, { useState } from "react";
// Importiere Bootstrap CSS für vorgefertigte Styles
import "bootstrap/dist/css/bootstrap.min.css";
// Importiere die eigene CSS-Datei für Kunden-spezifische Styles
import "../CSS/Customers.css";

/**
 * EditCustomerModal ist eine Komponente, die ein Modal-Fenster anzeigt,
 * in dem die Daten eines Kunden bearbeitet werden können.
 *
 * Props:
 * - customer: Das Kundenobjekt, das bearbeitet werden soll.
 * - onClose: Callback, um das Modal zu schließen.
 * - onSave: Callback, der mit den geänderten Kundendaten aufgerufen wird.
 */
const EditCustomerModal = ({ customer, onClose, onSave }) => {
  // Lokaler State für das Formular, initialisiert mit den Kundendaten
  const [formData, setFormData] = useState({ ...customer });

  /**
   * handleChange aktualisiert den State, wenn sich ein Input-Feld ändert.
   * @param {object} e - Das Event-Objekt vom Input-Feld.
   */
  const handleChange = (e) => {
    // Aktualisiere das entsprechende Feld im formData-Objekt
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * handleSave ruft den onSave Callback mit den aktuellen Formulardaten auf.
   */
  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog">
        {/* Modal-Inhalt mit angepasstem Hintergrund */}
        <div className="modal-content" style={{ backgroundColor: "#9cc2ca" }}>
          {/* Modal-Header mit Titel und Schließen-Button */}
          <div className="modal-header">
            <h5 className="modal-title">Edit Customer</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          {/* Modal-Body mit Formularfeldern zur Bearbeitung der Kundendaten */}
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">E-Mail</label>
              <input
                type="text"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Address</label>
              <input
                type="text"
                className="form-control"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Contact</label>
              <input
                type="text"
                className="form-control"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
              />
            </div>
          </div>
          {/* Modal-Footer mit Cancel- und Save-Buttons */}
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-dark" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCustomerModal;



