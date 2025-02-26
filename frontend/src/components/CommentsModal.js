import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { getAuthValue } from "./Header"; // Importiere die Funktion zur Authentifizierung

/**
 * Komponente CommentsModal zeigt ein Modal-Fenster zur Anzeige, 
 * Bearbeitung und Löschung von Kommentaren zu einem Angebot.
 *
 * Props:
 * - userGroup: Benutzergruppe (zur Bestimmung der Authentifizierung)
 * - onClose: Callback-Funktion zum Schließen des Modals
 * - offer: Das Angebot, zu dem die Kommentare gehören
 */
const CommentsModal = ({ userGroup, onClose, offer }) => {
  // Lokaler State für Kommentare, Eingabefelder, Lade- und Fehlerstatus
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  // Ermittele den Authentifizierungswert basierend auf der Benutzergruppe
  const authValue = getAuthValue(userGroup);

  /**
   * Ruft alle Kommentare für das aktuelle Angebot vom Server ab.
   */
  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/offers/${offer.id}/comments`,
        { headers: { Authorization: authValue } }
      );
      setComments(response.data);
    } catch (err) {
      setError("Fehler beim Laden der Kommentare.");
    }
    setLoading(false);
  }, [offer.id, authValue]);

  // Hole die Kommentare, sobald die Komponente geladen wird oder sich fetchComments ändert
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  /**
   * Fügt einen neuen Kommentar hinzu.
   * Wenn das Angebot den Status "On Ice" hat, wird das Hinzufügen unterbunden.
   */
  const handleAddComment = async () => {
    if (!newComment.trim()) return; // Leere Kommentare nicht zulassen
    if (offer.status === "On Ice") {
      setStatusMessage(
        "Das Hinzufügen von Kommentaren ist nicht erlaubt, da das Angebot auf 'On Ice' gesetzt wurde."
      );
      return;
    }
    setAdding(true);
    try {
      await axios.post(
        `http://localhost:8080/offers/${offer.id}/comments`,
        { text: newComment },
        { headers: { Authorization: authValue } }
      );
      setNewComment(""); // Eingabefeld leeren
      fetchComments(); // Kommentare neu laden
    } catch (err) {
      setError("Fehler beim Hinzufügen des Kommentars.");
    }
    setAdding(false);
  };

  /**
   * Aktualisiert einen bestehenden Kommentar.
   * @param {string} id - Die ID des zu bearbeitenden Kommentars
   */
  const handleEditComment = async (id) => {
    try {
      await axios.put(
        `http://localhost:8080/offers/${offer.id}/comments/${id}`,
        { text: editedCommentText },
        { headers: { Authorization: authValue } }
      );
      setEditingCommentId(null); // Bearbeitungsmodus beenden
      setEditedCommentText(""); // Eingabefeld zurücksetzen
      fetchComments(); // Kommentare neu laden
    } catch (err) {
      setError("Fehler beim Bearbeiten des Kommentars.");
    }
  };

  /**
   * Löscht einen Kommentar.
   * @param {string} id - Die ID des zu löschenden Kommentars
   */
  const handleDeleteComment = async (id) => {
    try {
      await axios.delete(
        `http://localhost:8080/offers/${offer.id}/comments/${id}`,
        { headers: { Authorization: authValue } }
      );
      fetchComments(); // Kommentare neu laden
    } catch (err) {
      setError("Fehler beim Löschen des Kommentars.");
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          {/* Modal-Header: Titel und Schließen-Button */}
          <div className="modal-header">
            <h5 className="modal-title">Kommentare für {offer.name}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {/* Anzeige einer Statusmeldung, falls vorhanden */}
            {statusMessage && (
              <div className="alert alert-warning">{statusMessage}</div>
            )}
            {loading ? (
              // Ladeindikator anzeigen
              <div className="text-center">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : error ? (
              // Fehlermeldung anzeigen
              <div className="alert alert-danger">{error}</div>
            ) : comments.length === 0 ? (
              // Hinweis, wenn keine Kommentare vorhanden sind
              <p className="text-muted">Noch keine Kommentare vorhanden.</p>
            ) : (
              // Liste der vorhandenen Kommentare
              <ul className="list-group">
                {comments.map((comment) => (
                  <li
                    key={comment.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    {editingCommentId === comment.id ? (
                      // Eingabefeld zum Bearbeiten des Kommentars
                      <input
                        type="text"
                        className="form-control"
                        value={editedCommentText}
                        onChange={(e) => setEditedCommentText(e.target.value)}
                      />
                    ) : (
                      // Anzeige des Kommentartexts
                      <span>{comment.text}</span>
                    )}
                    <div>
                      {editingCommentId === comment.id ? (
                        // Button zum Speichern der Änderungen
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() => handleEditComment(comment.id)}
                        >
                          Speichern
                        </button>
                      ) : (
                        // Button, um in den Bearbeitungsmodus zu wechseln
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditedCommentText(comment.text);
                          }}
                        >
                          Bearbeiten
                        </button>
                      )}
                      {/* Button zum Löschen des Kommentars */}
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        Löschen
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Eingabebereich zum Hinzufügen eines neuen Kommentars */}
            <div className="mt-3">
              <input
                type="text"
                className="form-control"
                placeholder="Neuer Kommentar"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={offer.status === "On Ice"}
              />
              <button
                className="btn btn-primary mt-2 w-100"
                onClick={handleAddComment}
                disabled={adding || offer.status === "On Ice"}
                style={{
                  backgroundColor: offer.status === "On Ice" ? "#d3d3d3" : "",
                }}
              >
                {adding ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  "Hinzufügen"
                )}
              </button>
            </div>
          </div>
          {/* Modal-Footer: Schließen-Button */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Schließen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;



