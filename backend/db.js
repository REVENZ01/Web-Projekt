// Importiere das sqlite3-Modul und aktiviere den "verbose" Modus für detaillierte Debug-Informationen.
const sqlite3 = require("sqlite3").verbose();

// Importiere das path-Modul, um Dateipfade plattformunabhängig zu erstellen.
const path = require("path");

// Erstelle den Pfad zur Datenbankdatei "mydatabase.db" im aktuellen Verzeichnis.
const dbPath = path.join(__dirname, "mydatabase.db");

// Öffne oder erstelle die SQLite-Datenbank unter dem angegebenen Pfad.
// Die Flags OPEN_READWRITE und OPEN_CREATE ermöglichen Lesen/Schreiben und das Erstellen,
// falls die Datenbank noch nicht existiert.
// Die Callback-Funktion informiert über den Verbindungsstatus.
const db = new sqlite3.Database(
  dbPath,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error("Fehler beim Verbinden mit der Datenbank:", err.message);
    } else {
      console.log("Mit der SQLite-Datenbank verbunden.");
    }
  }
);

// Exportiere die Datenbankinstanz, damit sie in anderen Modulen verwendet werden kann.
module.exports = db;


