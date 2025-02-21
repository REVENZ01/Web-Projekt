// textDataModal.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import { getAuthValue } from "./Header"; // Falls du Auth-Logik verwendest

const TextDataModal = ({ offer, onClose, userGroup }) => {
  const authValue = getAuthValue(userGroup);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");

  // Zustände für das Tag-Management
  const [activeTagFileId, setActiveTagFileId] = useState(null);
  const [fileTags, setFileTags] = useState([]); // Aktuelle Tags des aktiven Dokuments
  const [newTag, setNewTag] = useState("");
  const [editingTagId, setEditingTagId] = useState(null);
  const [editedTagText, setEditedTagText] = useState("");
  const [tagError, setTagError] = useState("");

  // Lädt die Dateien für das Angebot
  const fetchFiles = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/offers/${offer.id}/files`,
        { headers: { Authorization: authValue } }
      );
      setFiles(response.data);
    } catch (err) {
      console.error("Fehler beim Laden der Dateien:", err);
      setError("Fehler beim Laden der Dateien.");
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [offer.id]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Bitte wählen Sie eine Datei aus.");
      return;
    }
    if (!selectedFile.name.toLowerCase().endsWith(".txt")) {
      setError("Nur .txt Dateien werden unterstützt.");
      return;
    }
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      await axios.post(
        `http://localhost:8080/offers/${offer.id}/files`,
        formData,
        { headers: { Authorization: authValue } }
      );
      setSelectedFile(null);
      fetchFiles();
    } catch (err) {
      console.error("Fehler beim Hochladen der Datei:", err);
      setError("Fehler beim Hochladen der Datei.");
    }
  };

  // Tag-Management Funktionen
  const fetchTags = async (fileId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/offers/${offer.id}/files/${fileId}/tags`,
        { headers: { Authorization: authValue } }
      );
      setFileTags(response.data);
    } catch (err) {
      console.error("Fehler beim Laden der Tags:", err);
      setTagError("Fehler beim Laden der Tags.");
    }
  };

  const handleOpenTagManager = (fileId) => {
    setActiveTagFileId(fileId);
    setNewTag("");
    setEditingTagId(null);
    setEditedTagText("");
    setTagError("");
    fetchTags(fileId);
  };

  const handleCloseTagManager = () => {
    setActiveTagFileId(null);
    setFileTags([]);
    setNewTag("");
    setEditingTagId(null);
    setEditedTagText("");
    setTagError("");
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    try {
      await axios.post(
        `http://localhost:8080/offers/${offer.id}/files/${activeTagFileId}/tags`,
        { text: newTag },
        { headers: { Authorization: authValue } }
      );
      setNewTag("");
      fetchTags(activeTagFileId);
    } catch (err) {
      console.error("Fehler beim Hinzufügen des Tags:", err);
      setTagError("Fehler beim Hinzufügen des Tags.");
    }
  };

  const handleEditTag = async (tagId) => {
    if (!editedTagText.trim()) return;
    try {
      await axios.put(
        `http://localhost:8080/offers/${offer.id}/files/${activeTagFileId}/tags/${tagId}`,
        { text: editedTagText },
        { headers: { Authorization: authValue } }
      );
      setEditingTagId(null);
      setEditedTagText("");
      fetchTags(activeTagFileId);
    } catch (err) {
      console.error("Fehler beim Bearbeiten des Tags:", err);
      setTagError("Fehler beim Bearbeiten des Tags.");
    }
  };

  const handleDeleteTag = async (tagId) => {
    try {
      await axios.delete(
        `http://localhost:8080/offers/${offer.id}/files/${activeTagFileId}/tags/${tagId}`,
        { headers: { Authorization: authValue } }
      );
      fetchTags(activeTagFileId);
    } catch (err) {
      console.error("Fehler beim Löschen des Tags:", err);
      setTagError("Fehler beim Löschen des Tags.");
    }
  };

  return (
    <Modal show onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Dateien für Angebot {offer.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <p className="text-danger">{error}</p>}
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label>Datei hochladen (.txt)</Form.Label>
          <Form.Control type="file" accept=".txt" onChange={handleFileChange} />
        </Form.Group>
        <Button variant="primary" onClick={handleUpload}>
          📤Upload
        </Button>
        <hr />
        <h5>📂 Hochgeladene Dateien</h5>
        <ul className="list-group">
          {files.map((file) => {
            // Berechne die Anzahl der Tags anhand der JSON-kodierten Zeichenkette in file.tag
            let tagCount = 0;
            try {
              tagCount = JSON.parse(file.tag || "[]").length;
            } catch (e) {
              tagCount = 0;
            }
            return (
              <li key={file.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center">
                  <a
                    href={`http://localhost:8080${file.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {file.name}
                  </a>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => handleOpenTagManager(file.id)}
                  >
                    Tags bearbeiten ({tagCount})
                  </Button>
                </div>
                {activeTagFileId === file.id && (
                  <div className="mt-3 border p-2">
                    <h6>Tags für {file.name}</h6>
                    {tagError && <p className="text-danger">{tagError}</p>}
                    {fileTags.length === 0 ? (
                      <p className="text-muted">Keine Tags vorhanden.</p>
                    ) : (
                      <ul className="list-group">
                        {fileTags.map((tag) => (
                          <li
                            key={tag.id}
                            className="list-group-item d-flex justify-content-between align-items-center"
                          >
                            {editingTagId === tag.id ? (
                              <Form.Control
                                type="text"
                                value={editedTagText}
                                onChange={(e) => setEditedTagText(e.target.value)}
                              />
                            ) : (
                              <span>{tag.text}</span>
                            )}
                            <div>
                              {editingTagId === tag.id ? (
                                <Button
                                  variant="success"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => handleEditTag(tag.id)}
                                >
                                  Speichern
                                </Button>
                              ) : (
                                <Button
                                  variant="warning"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => {
                                    setEditingTagId(tag.id);
                                    setEditedTagText(tag.text);
                                  }}
                                >
                                  Bearbeiten
                                </Button>
                              )}
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteTag(tag.id)}
                              >
                                Löschen
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-2 d-flex">
                      <Form.Control
                        type="text"
                        placeholder="Neuer Tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                      />
                      <Button variant="primary" className="ms-2" onClick={handleAddTag}>
                        Hinzufügen
                      </Button>
                    </div>
                    <Button variant="secondary" className="mt-2" onClick={handleCloseTagManager}>
                      Schließen
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Schließen
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TextDataModal;








