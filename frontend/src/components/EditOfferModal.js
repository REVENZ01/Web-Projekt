import React, { useState } from "react";
// Importiere Bootstrap CSS für das Styling des Modals
import "bootstrap/dist/css/bootstrap.min.css";
// Importiere eigene CSS-Datei für Angebots-spezifische Styles
import "../CSS/Offers.css";

/**
 * EditOfferModal ist ein Modal-Fenster, in dem ein Angebot bearbeitet werden kann.
 *
 * Props:
 * - offer: Das zu bearbeitende Angebot
 * - onClose: Callback, um das Modal zu schließen
 * - onSave: Callback, der die aktualisierten Angebotsdaten zurückgibt
 */
const EditOfferModal = ({ offer, onClose, onSave }) => {
  // Lokaler State, initialisiert mit den aktuellen Angebotsdaten
  const [formData, setFormData] = useState({ ...offer });

  /**
   * handleChange aktualisiert den State, wenn sich ein Formularfeld ändert.
   * @param {object} e - Das Ereignisobjekt vom Input-Feld
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * handleSave gibt die aktuellen Formulardaten über den onSave Callback zurück.
   */
  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog">
        {/* Modal-Inhalt mit einem angepassten Hintergrund */}
        <div className="modal-content" style={{ backgroundColor: "#9cc2ca" }}>
          {/* Modal-Header mit Titel und Schließen-Button */}
          <div className="modal-header">
            <h5 className="modal-title">Edit Offer</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          {/* Modal-Body mit Formularfeldern zur Bearbeitung des Angebots */}
          <div className="modal-body">
            {/* Feld für den Angebotsnamen */}
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
            {/* Feld für den Angebotspreis */}
            <div className="mb-3">
              <label className="form-label">Price</label>
              <input
                type="number"
                className="form-control"
                name="price"
                value={formData.price}
                onChange={handleChange}
              />
            </div>
            {/* Auswahlfeld für die Währung */}
            <div className="mb-3">
              <label className="form-label">Currency</label>
              <select
                className="form-select"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            {/* Textbereich für die Angebotsbeschreibung */}
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
              ></textarea>
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

export default EditOfferModal;


