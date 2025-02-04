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

  // ✅ `fetchComments` mit useCallback verhindern, dass es in jeder Render-Phase neu erstellt wird
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

  // ✅ `useEffect` jetzt mit fetchComments als Dependency
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setAdding(true);
    try {
      await axios.post(`http://localhost:8080/offers/${offer.id}/comments`, {
        text: newComment,
      });
      setNewComment("");
      fetchComments(); // ✅ Kommentare nach dem Hinzufügen neu laden
    } catch (err) {
      setError("Fehler beim Hinzufügen des Kommentars.");
    }
    setAdding(false);
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(
        `http://localhost:8080/offers/${offer.id}/comments/${commentId}`
      );
      fetchComments(); // ✅ Kommentare nach dem Löschen neu laden
    } catch (err) {
      setError("Fehler beim Löschen des Kommentars.");
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditedCommentText(comment.text);
  };

  const handleSaveEditedComment = async () => {
    if (!editedCommentText.trim()) return;
    try {
      await axios.put(
        `http://localhost:8080/offers/${offer.id}/comments/${editingCommentId}`,
        {
          text: editedCommentText,
        }
      );
      setEditingCommentId(null);
      fetchComments(); // ✅ Kommentare nach dem Bearbeiten neu laden
    } catch (err) {
      setError("Fehler beim Aktualisieren des Kommentars.");
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          {/* Modal Header */}
          <div className="modal-header">
            <h5 className="modal-title">Kommentare für {offer.name}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body">
            {loading ? (
              <div className="text-center">
                <div
                  className="spinner-border text-primary"
                  role="status"
                ></div>
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : comments.length === 0 ? (
              <p className="text-muted">Noch keine Kommentare vorhanden.</p>
            ) : (
              <ul className="list-group">
                {comments.map((comment) => (
                  <li
                    key={comment.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    {editingCommentId === comment.id ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editedCommentText}
                        onChange={(e) => setEditedCommentText(e.target.value)}
                      />
                    ) : (
                      <span>{comment.text}</span>
                    )}
                    <div>
                      {editingCommentId === comment.id ? (
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={handleSaveEditedComment}
                        >
                          Speichern
                        </button>
                      ) : (
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => handleEditComment(comment)}
                        >
                          Bearbeiten
                        </button>
                      )}
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

            {/* Kommentar hinzufügen */}
            <div className="mt-3">
              <input
                type="text"
                className="form-control"
                placeholder="Neuer Kommentar"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                className="btn btn-primary mt-2 w-100"
                onClick={handleAddComment}
                disabled={adding}
              >
                {adding ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  "Hinzufügen"
                )}
              </button>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;
