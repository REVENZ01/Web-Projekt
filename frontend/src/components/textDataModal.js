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
    // Statt nur des MIME-Typs prüfen wir zusätzlich die Dateiendung
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
        {
          headers: { Authorization: authValue }, // Kein manueller "Content-Type"-Header!
        }
      );
      setSelectedFile(null);
      fetchFiles();
    } catch (err) {
      console.error("Fehler beim Hochladen der Datei:", err);
      setError("Fehler beim Hochladen der Datei.");
    }
  };

  return (
    <Modal show onHide={onClose}>
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
        <h5>📂Hochgeladene Dateien</h5>
        <ul>
          {files.map((file) => (
            <li key={file.id}>
              <a
                href={`http://localhost:8080${file.url}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {file.name}
              </a>
            </li>
          ))}
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


