import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const CommentsModal = ({ offer, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/offers/${offer.id}/comments`
      );
      setComments(response.data);
    } catch (err) {
      setError("Fehler beim Laden der Kommentare.");
    }
    setLoading(false);
  }, [offer.id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (offer.status === "On Ice") {
      setStatusMessage("Das Hinzufügen von Kommentaren ist nicht erlaubt, da das Angebot auf 'On Ice' gesetzt wurde.");
      return;
    }
    setAdding(true);
    try {
      await axios.post(`http://localhost:8080/offers/${offer.id}/comments`, {
        text: newComment,
      });
      setNewComment("");
      fetchComments();
    } catch (err) {
      setError("Fehler beim Hinzufügen des Kommentars.");
    }
    setAdding(false);
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Kommentare für {offer.name}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {statusMessage && <div className="alert alert-warning">{statusMessage}</div>}
            {loading ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : comments.length === 0 ? (
              <p className="text-muted">Noch keine Kommentare vorhanden.</p>
            ) : (
              <ul className="list-group">
                {comments.map((comment) => (
                  <li key={comment.id} className="list-group-item">
                    <span>{comment.text}</span>
                  </li>
                ))}
              </ul>
            )}

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
                style={{ backgroundColor: offer.status === "On Ice" ? "#d3d3d3" : "" }}
              >
                {adding ? <span className="spinner-border spinner-border-sm"></span> : "Hinzufügen"}
              </button>
            </div>
          </div>
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


