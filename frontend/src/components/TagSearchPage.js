import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Form, Button, Table, Alert } from "react-bootstrap";
import { getAuthValue } from "./Header"; // Falls Auth-Logik verwendet wird
import "../CSS/TagSearchPage.css";

/**
 * TagSearchPage
 * Komponente zur Suche nach Dateien anhand von Tags.
 * Ermöglicht das Starten einer Suche, das Polling des Suchstatus und das Anzeigen der Ergebnisse.
 *
 * @param {Object} props - Enthält userGroup zur Authentifizierung.
 */
const TagSearchPage = ({ userGroup }) => {
  const authValue = getAuthValue(userGroup);
  const [tagInput, setTagInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [searchStatus, setSearchStatus] = useState(null); // "Pending" oder "Completed"
  const [result, setResult] = useState([]);
  const [error, setError] = useState("");

  /**
   * handleSearch
   * Startet die Suche nach Dateien mit den eingegebenen, kommagetrennten Tags.
   * Sendet eine POST-Anfrage, speichert die Task-ID und setzt den Status auf "Pending".
   */
  const handleSearch = async () => {
    const tags = tagInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    if (tags.length === 0) {
      setError("Bitte geben Sie mindestens einen Tag ein.");
      return;
    }
    setError("");
    setIsSearching(true);
    setSearchStatus("Pending");
    setResult([]);
    try {
      const response = await axios.post(
        "http://localhost:8080/tags/search",
        { tags, substring: true, caseInsensitive: true },
        { headers: { Authorization: authValue } }
      );
      setTaskId(response.data.taskId);
    } catch (err) {
      console.error("Fehler beim Starten der Suche:", err);
      setError("Fehler beim Starten der Suche.");
      setIsSearching(false);
    }
  };

  /**
   * useEffect (Polling)
   * Fragt alle 60 Sekunden den Status der Long Running Operation ab.
   * Sobald der Status "Completed" erreicht ist, werden die Suchergebnisse abgerufen und angezeigt.
   */
  useEffect(() => {
    let intervalId;
    if (taskId && searchStatus === "Pending") {
      intervalId = setInterval(async () => {
        try {
          const response = await axios.get(
            `http://localhost:8080/tags/search/${taskId}`,
            { headers: { Authorization: authValue } }
          );
          if (response.data.status === "Completed") {
            setResult(response.data.result);
            setSearchStatus("Completed");
            setIsSearching(false);
            clearInterval(intervalId);
          }
        } catch (err) {
          console.error("Fehler beim Abfragen des Task-Status:", err);
          setError("Fehler beim Abfragen des Task-Status.");
          setIsSearching(false);
          clearInterval(intervalId);
        }
      }, 60000);
    }
    return () => clearInterval(intervalId);
  }, [taskId, searchStatus, authValue]);

  /**
   * handleNewSearch
   * Setzt alle States zurück, um eine neue Suche zu starten.
   */
  const handleNewSearch = () => {
    setTagInput("");
    setTaskId(null);
    setSearchStatus(null);
    setResult([]);
    setError("");
    setIsSearching(false);
  };

  return (
    <Container className="mt-4" style={{ marginBottom: "15rem" }}>
      <h2>Suche nach Dateien über Tags</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form>
        <Form.Group controlId="tagSearchInput">
          <Form.Label>Tags (kommagetrennt)</Form.Label>
          <Form.Control
            type="text"
            placeholder="z.B. hallo, beispiel"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            disabled={isSearching}
          />
        </Form.Group>
        <Button
          variant="secondary"
          className="mt-2"
          onClick={handleSearch}
          disabled={isSearching || !tagInput.trim()}
          style={{
            backgroundColor:
              isSearching || !tagInput.trim() ? "lightgrey" : undefined,
          }}
        >
          Suche starten
        </Button>
      </Form>

      {isSearching && (
        <Alert variant="info" className="mt-3">
          Suche läuft... Bitte warten.
        </Alert>
      )}

      {searchStatus === "Completed" && (
        <div className="mt-4">
          <h4>Suchergebnisse:</h4>
          {result.length === 0 ? (
            <Alert variant="warning">
              Keine Dateien mit den angegebenen Tags gefunden.
            </Alert>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Dateiname</th>
                  <th>Link</th>
                </tr>
              </thead>
              <tbody>
                {result.map((file) => (
                  <tr key={file.id}>
                    <td>{file.name}</td>
                    <td>
                      <a
                        href={`http://localhost:8080${file.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Datei öffnen
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          <Button variant="secondary" onClick={handleNewSearch}>
            Neue Suche
          </Button>
        </div>
      )}
    </Container>
  );
};

export default TagSearchPage;



